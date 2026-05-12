import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCcw, Sliders, Crop, Palette, Sun, Contrast } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PosterEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onClose: () => void;
}

const FILTERS = [
  { name: 'None', filter: 'none' },
  { name: 'Vibrant', filter: 'saturate(1.5) contrast(1.1)' },
  { name: 'Dramatic', filter: 'contrast(1.4) brightness(0.9) saturate(0.8)' },
  { name: 'Warm', filter: 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)' },
  { name: 'Cool', filter: 'saturate(1.1) hue-rotate(10deg) brightness(1.1)' },
  { name: 'B&W', filter: 'grayscale(1)' },
  { name: 'Vintage', filter: 'sepia(0.5) contrast(0.9) brightness(1.1)' },
];

export const PosterEditor: React.FC<PosterEditorProps> = ({ imageUrl, onSave, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [activeFilter, setActiveFilter] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'filter'>('crop');

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    brightness: number,
    contrast: number,
    filter: string
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Apply filters to the context
    ctx.filter = `${filter} brightness(${brightness}%) contrast(${contrast}%)`;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const editedImage = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        brightness,
        contrast,
        activeFilter
      );
      onSave(editedImage);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setActiveFilter('none');
    setZoom(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
    >
      <div className="bg-white w-full max-w-5xl h-full max-h-[800px] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-bottom border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Fine-tune Poster</h3>
              <p className="text-xs text-slate-500">Adjust your generated image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 relative bg-slate-50 flex flex-col md:flex-row overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 relative min-h-[300px] md:min-h-0 bg-slate-200">
            <div className="absolute inset-0">
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                style={{
                  containerStyle: {
                    filter: `${activeFilter} brightness(${brightness}%) contrast(${contrast}%)`,
                  },
                }}
              />
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-full md:w-80 bg-white border-left border-slate-100 flex flex-col">
            {/* Tabs */}
            <div className="flex border-bottom border-slate-100">
              <button
                onClick={() => setActiveTab('crop')}
                className={`flex-1 py-4 text-sm font-bold flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'crop' ? 'text-amber-600 border-bottom-2 border-amber-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Crop size={18} />
                <span>Crop</span>
              </button>
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex-1 py-4 text-sm font-bold flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'adjust' ? 'text-amber-600 border-bottom-2 border-amber-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Sun size={18} />
                <span>Adjust</span>
              </button>
              <button
                onClick={() => setActiveTab('filter')}
                className={`flex-1 py-4 text-sm font-bold flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'filter' ? 'text-amber-600 border-bottom-2 border-amber-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Palette size={18} />
                <span>Filters</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {activeTab === 'crop' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zoom Level</label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>1x</span>
                      <span>2x</span>
                      <span>3x</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'adjust' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Sun size={14} /> Brightness
                      </label>
                      <span className="text-xs font-bold text-amber-600">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      value={brightness}
                      min={50}
                      max={150}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Contrast size={14} /> Contrast
                      </label>
                      <span className="text-xs font-bold text-amber-600">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      value={contrast}
                      min={50}
                      max={150}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'filter' && (
                <div className="grid grid-cols-2 gap-3">
                  {FILTERS.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setActiveFilter(f.filter)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        activeFilter === f.filter
                          ? 'border-amber-600 bg-amber-50 text-amber-600'
                          : 'border-slate-100 hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      <div 
                        className="w-full aspect-square rounded-lg mb-2 bg-slate-200 overflow-hidden"
                        style={{ filter: f.filter }}
                      >
                        <img src={imageUrl} alt={f.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{f.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-top border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                onClick={resetAdjustments}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-all"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex-[2] py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
