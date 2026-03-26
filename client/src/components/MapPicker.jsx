import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Search, MapPin } from 'lucide-react';
import axios from 'axios';

// Fix leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ location, onLocationChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePositionChange = async (pos) => {
    try {
      setLoading(true);
      // Reverse geocode
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
      onLocationChange({
        lat: pos.lat,
        lng: pos.lng,
        address: response.data?.display_name || 'Unknown Location'
      });
    } catch (err) {
      console.error(err);
      onLocationChange({ ...location, lat: pos.lat, lng: pos.lng });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handlePositionChange({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error(error);
          setLoading(false);
          alert("Couldn't get location.");
        }
      );
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        handlePositionChange({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-white">
        <button 
          onClick={getCurrentLocation}
          className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors"
          disabled={loading}
        >
          <Navigation size={18} /> Current Location
        </button>
        
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search location..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[location.lat, location.lng]} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={{ lat: location.lat, lng: location.lng }} setPosition={handlePositionChange} />
        </MapContainer>
        
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm shadow-inner transition-colors">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider">Latitude</span>
            <span className="font-mono text-gray-900 dark:text-white font-semibold bg-white dark:bg-gray-700 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm text-center">
              {location.lat.toFixed(6)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider">Longitude</span>
            <span className="font-mono text-gray-900 dark:text-white font-semibold bg-white dark:bg-gray-700 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm text-center">
              {location.lng.toFixed(6)}
            </span>
          </div>
        </div>
        <div className="flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg p-3 shadow-sm gap-3 items-center">
          <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-full hidden sm:block">
            <MapPin size={18} className="text-red-500" />
          </div>
          <span className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed flex-1">
            {location.address}
          </span>
        </div>
      </div>
    </div>
  );
}
