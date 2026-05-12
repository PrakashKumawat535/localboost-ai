const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function getDataUrlMimeType(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match?.[1] || 'image/jpeg';
}

function getUploadErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Upload failed';
}

export async function uploadBase64Image(base64Image: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Missing Cloudinary config. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment.'
    );
  }

  const mimeType = getDataUrlMimeType(base64Image);
  const formData = new FormData();
  formData.append('file', base64Image);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'localboost');
  formData.append('resource_type', mimeType.startsWith('image/') ? 'image' : 'auto');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${details}`);
  }

  const data = await response.json();
  if (!data?.secure_url) {
    throw new Error('Cloudinary upload did not return a secure URL');
  }

  return data.secure_url as string;
}

export function formatUploadError(error: unknown): string {
  return getUploadErrorMessage(error);
}