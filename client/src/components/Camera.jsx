import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Image as ImageIcon, X, RefreshCcw } from 'lucide-react';

export default function CameraComponent({ onCapture, currentImage }) {
  const webcamRef = useRef(null);
  const [useWebcam, setUseWebcam] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
      setUseWebcam(false);
    }
  }, [webcamRef, onCapture]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (currentImage) {
    return (
      <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-center items-center p-2 min-h-[300px]">
        <img src={currentImage} alt="Captured" className="max-h-[400px] object-contain rounded-lg shadow-sm" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button 
            onClick={() => onCapture(null)}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transform hover:scale-105 transition-all"
            title="Remove Image"
          >
            <X size={24} />
          </button>
        </div>
      </div>
    );
  }

  if (useWebcam) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-black flex flex-col items-center">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full max-h-[400px] object-cover"
          videoConstraints={{ facingMode: 'environment' }}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button 
            onClick={capture}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg transform hover:scale-105 transition-all font-semibold"
          >
            <Camera size={20} /> Capture
          </button>
          <button 
            onClick={() => setUseWebcam(false)}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[250px]">
      <button 
        onClick={() => setUseWebcam(true)}
        className="group flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:border-blue-400 transition-all text-blue-600 dark:text-blue-400"
      >
        <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
          <Camera size={32} />
        </div>
        <span className="font-semibold text-lg">Use Camera</span>
      </button>

      <label className="cursor-pointer group flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/10 hover:bg-teal-100 dark:hover:bg-teal-900/20 hover:border-teal-400 transition-all text-teal-600 dark:text-teal-400">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
          <ImageIcon size={32} />
        </div>
        <span className="font-semibold text-lg">Upload Photo</span>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
}
