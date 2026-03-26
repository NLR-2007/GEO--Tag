import React from 'react';
import { Type, Calendar, Palette, LayoutTemplate } from 'lucide-react';
import { format } from 'date-fns';

export default function OverlayEditor({ settings, onSettingsChange }) {
  
  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleDateChange = (e) => {
    // If user changes datetime manually
    try {
      const d = new Date(e.target.value);
      if (!isNaN(d.getTime())) {
         updateSetting('datetime', d.toISOString());
      }
    } catch {}
  };

  const formattedDate = settings.datetime ? format(new Date(settings.datetime), "yyyy-MM-dd'T'HH:mm") : '';

  return (
    <div className="space-y-6">
      
      {/* Template Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          <LayoutTemplate size={16} className="text-blue-500" />
          Layout Template
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['minimal', 'detailed', 'satellite'].map(tmpl => (
            <button
              key={tmpl}
              onClick={() => updateSetting('template', tmpl)}
              className={`py-2 px-1 text-xs font-semibold rounded-lg border-2 transition-all capitalize ${
                settings.template === tmpl 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {tmpl}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          <Palette size={16} className="text-purple-500" />
          Overlay Theme
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="theme" 
              value="dark" 
              checked={settings.theme === 'dark'}
              onChange={() => updateSetting('theme', 'dark')}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm font-medium">Dark Mode</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="theme" 
              value="light" 
              checked={settings.theme === 'light'}
              onChange={() => updateSetting('theme', 'light')}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm font-medium">Light Mode</span>
          </label>
        </div>
      </div>

      {/* Custom Text */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          <Type size={16} className="text-green-500" />
          Custom Text / Notes
        </label>
        <input 
          type="text" 
          placeholder="e.g. Site Survey Project Alpha"
          value={settings.customText}
          onChange={(e) => updateSetting('customText', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
        />
      </div>

      {/* Datetime Override */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
          <Calendar size={16} className="text-orange-500" />
          Date & Time
        </label>
        <div className="flex gap-2">
          <input 
            type="datetime-local" 
            value={formattedDate}
            onChange={handleDateChange}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          />
          <button 
            onClick={() => updateSetting('datetime', new Date().toISOString())}
            title="Set to Current Time"
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Now
          </button>
        </div>
      </div>

    </div>
  );
}
