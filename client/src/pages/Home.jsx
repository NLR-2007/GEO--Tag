import React, { useState } from 'react';
import Camera from '../components/Camera';
import MapPicker from '../components/MapPicker';
import OverlayEditor from '../components/OverlayEditor';
import Preview from '../components/Preview';
import { Camera as CameraIcon, Map, Settings, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    address: 'New York City, NY, USA'
  });
  const [overlaySettings, setOverlaySettings] = useState({
    template: 'detailed', // minimal, detailed, satellite
    customText: '',
    datetime: new Date().toISOString(),
    theme: 'dark' // dark, light backings
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-8 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center py-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 drop-shadow-sm mb-2">
            NLR -- Geo Tag Space
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Capture or upload photos and embed precise GPS data visually.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Capture / Upload */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transform transition hover:shadow-md">
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                  <CameraIcon size={20} />
                </div>
                <h2 className="text-xl font-bold">1. Photo Source</h2>
              </div>
              <div className="p-6">
                <Camera onCapture={setImage} currentImage={image} />
              </div>
            </section>

            {/* Step 2: Location Data */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transform transition hover:shadow-md">
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-lg">
                  <Map size={20} />
                </div>
                <h2 className="text-xl font-bold">2. Location Data</h2>
              </div>
              <div className="p-0 sm:p-6">
                <MapPicker location={location} onLocationChange={setLocation} />
              </div>
            </section>
            
          </div>

          {/* Right Column - Preview & Overlays (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transform transition hover:shadow-md">
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Settings size={20} />
                </div>
                <h2 className="text-xl font-bold">3. Overlay Styling</h2>
              </div>
              <div className="p-6">
                <OverlayEditor settings={overlaySettings} onSettingsChange={setOverlaySettings} />
              </div>
            </section>
            
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transform transition hover:shadow-md sticky top-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg">
                  <ImageIcon size={20} />
                </div>
                <h2 className="text-xl font-bold">4. Live Preview</h2>
              </div>
              <div className="p-4 bg-gray-950">
                <Preview 
                  image={image} 
                  location={location} 
                  settings={overlaySettings} 
                />
              </div>
            </section>
            
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 font-semibold py-6 border-t border-gray-200 dark:border-gray-800 tracking-wide shadow-sm bg-white dark:bg-gray-800 rounded-xl px-4">
          © {new Date().getFullYear()} NLR GROUP OF COMAPANY
        </footer>
      </div>
    </div>
  );
}
