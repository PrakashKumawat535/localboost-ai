import { GoogleGenAI } from "@google/genai";
import axios from "axios";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

// For Veo and other paid models that require user-selected API keys
export const getPaidAI = () => {
  return new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '' });
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 5, delay = 3000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    // Robust rate limit detection
    const message = (error.message || '').toLowerCase();
    const status = error.status || error.code || error.error?.code || error.response?.status || error.response?.data?.error?.code;
    const errorString = typeof error === 'object' ? JSON.stringify(error).toLowerCase() : String(error).toLowerCase();
    
    const isRateLimit = status === 429 || 
                        message.includes('429') || 
                        message.includes('resource_exhausted') ||
                        message.includes('quota') ||
                        message.includes('rate limit') ||
                        errorString.includes('429') ||
                        errorString.includes('resource_exhausted') ||
                        errorString.includes('quota') ||
                        errorString.includes('rate_limit');
    
    if (retries > 0 && isRateLimit) {
      // If it's a hard quota error, we still try a few times with longer delay, 
      // but we also allow it to fail so fallback can take over if needed.
      const nextDelay = delay * (2 + Math.random());
      console.warn(`Rate limited or quota exceeded. Retrying in ${Math.round(nextDelay)}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, nextDelay));
      return withRetry(fn, retries - 1, nextDelay);
    }
    throw error;
  }
};

const urlToBase64 = async (url: string) => {
  if (url.startsWith('data:')) return url;
  try {
    // Try direct fetch first (faster if CORS is allowed)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15s for better reliability

    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (fetchError: any) {
      // If it was a timeout, don't try the proxy with an aborted signal
      if (fetchError.name === 'AbortError' || controller.signal.aborted) {
        throw fetchError;
      }
      
      // If direct fetch fails (likely CORS), try the proxy
      console.warn("Direct fetch failed (likely CORS), trying proxy...", fetchError.message);
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      
      // We use the same controller/signal because it hasn't timed out yet
      response = await fetch(proxyUrl, { signal: controller.signal });
    }
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error("Error converting URL to base64:", error);
    if (error.name === 'AbortError') {
      throw new Error("Image download timed out. Please try a smaller image or upload directly.");
    }
    throw new Error("Could not access the image URL. This might be due to security restrictions (CORS). Please upload the image directly instead.");
  }
};

export const generateText = async (prompt: string, systemInstruction: string, imageUrl?: string | null) => {
  let base64Image = null;
  if (imageUrl) {
    try {
      base64Image = await urlToBase64(imageUrl);
    } catch (e) {
      console.warn("Continuing without image due to fetch error:", e);
    }
  }

  const models = ["gemini-3-flash-preview", "gemini-3.1-flash-lite-preview", "gemini-3.1-pro-preview", "gemini-3-pro-preview", "gemini-3-flash-lite-preview", "gemini-flash-latest", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest", "gemini-1.5-pro", "gemini-1.5-pro-vision", "gemini-2.0-flash-exp", "gemini-2.0-flash-lite-preview", "gemini-pro-vision", "gemini-1.0-pro", "gemini-pro-latest", "gemini-pro"];
  let lastError = null;

  for (const model of models) {
    try {
      return await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: model,
          contents: base64Image 
            ? [
                {
                  parts: [
                    { text: prompt },
                    { inlineData: { data: base64Image.split(',')[1], mimeType: "image/jpeg" } }
                  ]
                }
              ]
            : prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }],
          },
        });
        return response.text;
      }, 2); // Fewer retries per model to cycle through them faster
    } catch (error) {
      console.warn(`Gemini Text Generation failed for model ${model}:`, error);
      lastError = error;
    }
  }

  // If all frontend models failed, try backend fallback
  console.warn("All frontend Gemini models failed, trying backend fallback...");
  try {
    const response = await axios.post("/api/ai/generate-text", {
      prompt,
      systemInstruction,
      imageUrl
    });
    if (response.data && response.data.content) {
      return response.data.content;
    }
    throw new Error("Invalid response from text fallback");
  } catch (fallbackError) {
    console.error("Text fallback also failed:", fallbackError);
    throw lastError || fallbackError;
  }
};

export const generateImage = async (prompt: string, imageUrl?: string | null, quality: '512px' | '1K' | '2K' | '4K' = '2K') => {
  const aistudio = (window as any).aistudio;
  const hasSelectedKey = aistudio?.hasSelectedApiKey
    ? await aistudio.hasSelectedApiKey().catch(() => false)
    : false;
  const paidAi = getPaidAI();
  const parts: any[] = [{ text: prompt }];

  if (imageUrl) {
    try {
      const base64Image = await urlToBase64(imageUrl);
      parts.push({
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: "image/jpeg"
        }
      });
    } catch (e) {
      console.warn("Continuing image generation without reference image due to fetch error:", e);
    }
  }

  // Try the best available model first
  const modelsToTry = hasSelectedKey 
    ? ['gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview', 'gemini-2.5-flash-image']
    : ['gemini-2.5-flash-image', 'gemini-3-flash-preview']; // gemini-3-flash-preview can also do images

  for (const modelName of modelsToTry) {
    try {
      const response = await withRetry(() => paidAi.models.generateContent({
        model: modelName,
        contents: [{ parts }],
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: modelName.includes('3') ? quality : '1K'
          },
          // Only add search grounding for 3.1 models
          ...(modelName.includes('3.1') || modelName === 'gemini-3-pro-image-preview' ? {
            tools: [
              {
                googleSearch: {
                  searchTypes: {
                    webSearch: {},
                    imageSearch: {},
                  }
                },
              },
            ],
          } : {}),
        },
      }), 2, 2000); // Fewer retries for faster fallback

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      console.warn(`Model ${modelName} returned no image data.`);
    } catch (error: any) {
      console.warn(`Image generation with ${modelName} failed:`, error.message || error);
    }
  }

  // Try Imagen 4.0 as a final Gemini fallback
  try {
    const imagenResponse = await withRetry(() => paidAi.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    }));

    if (imagenResponse.generatedImages?.[0]?.image?.imageBytes) {
      return `data:image/jpeg;base64,${imagenResponse.generatedImages[0].image.imageBytes}`;
    }
  } catch (imagenError) {
    console.warn("Imagen 4.0 also failed:", imagenError);
  }

  // If all Gemini models failed, try backend fallback
  console.warn("All Gemini Image models failed, trying backend fallback...");
  try {
    const response = await axios.post("/api/ai/generate-image", { prompt });
    if (response.data && response.data.url) {
      return response.data.url;
    }
    throw new Error("Invalid response from image fallback");
  } catch (fallbackError: any) {
    console.error("Image fallback also failed:", fallbackError.response?.data || fallbackError.message);
    throw new Error("All image generation services are currently unavailable. Please try again later.");
  }
};

export const generateVideo = async (prompt: string, imageUrl?: string | null) => {
  const paidAi = getPaidAI();
  
  try {
    let operation = await paidAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: imageUrl ? {
        imageBytes: (await urlToBase64(imageUrl)).split(',')[1],
        mimeType: 'image/png',
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '1:1'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await paidAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed - no download link returned.");

    // Fetch the video via proxy to avoid CORS and handle headers
    const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(downloadLink)}&apiKey=${encodeURIComponent(apiKey)}`;
    
    const response = await fetch(proxyUrl);

    if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Veo Video Generation failed:", error);
    throw error;
  }
};
