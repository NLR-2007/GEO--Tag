import React, { useRef, useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Preview({ image, location, settings }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    if (!image) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas dimensions to match image
      // Limit max dimension for performance while keeping it high-res
      const MAX_WIDTH = 1920;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height = (MAX_WIDTH * height) / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Draw Overlay
      drawOverlay(ctx, width, height, location, settings);

      // Create download URI
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setDownloadUrl(dataUrl);
      } catch (e) {
        console.error("Canvas export failed (likely CORS taint if external image): ", e);
      }
      setIsDrawing(false);
    };
    img.src = image;
  }, [image, location, settings]);

  const drawOverlay = (ctx, canvasWidth, canvasHeight, loc, setts) => {
    const isDark = setts.theme === 'dark';
    const bgFill = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.85)';
    const textFill = isDark ? '#ffffff' : '#111827';
    const secondaryFill = isDark ? '#9ca3af' : '#4b5563';
    const accentFill = '#3b82f6'; // blue-500

    // Base padding relative to image size
    const padding = Math.max(20, Math.floor(canvasWidth * 0.02));
    const fontSize = Math.max(16, Math.floor(canvasWidth * 0.025));
    const mapSize = Math.max(100, Math.min(200, canvasWidth * 0.25)); // Map is 25% of width, max 200px
    
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    const formattedDate = format(new Date(setts.datetime), 'dd MMM yyyy, HH:mm:ss');
    const geoText = `Lat: ${loc.lat.toFixed(6)}  Lng: ${loc.lng.toFixed(6)}`;
    
    let stringsToDraw = [];
    
    if (setts.template === 'minimal') {
      stringsToDraw.push([geoText, 'bold']);
      stringsToDraw.push([loc.address || 'Unknown Location', 'normal']);
    } else if (setts.template === 'satellite') {
      stringsToDraw.push([geoText, 'bold', accentFill]);
      stringsToDraw.push([formattedDate, 'normal']);
    } else {
      // detailed
      stringsToDraw.push([geoText, 'bold']);
      stringsToDraw.push([loc.address || 'Unknown Location', 'normal']);
      stringsToDraw.push([formattedDate, 'normal', secondaryFill]);
      if (setts.customText) {
        stringsToDraw.push([setts.customText, 'italic', accentFill]);
      }
    }

    // Calculate lines dynamically to avoid overlaps
    const lineHeight = fontSize * 1.4;
    const textBoxWidth = canvasWidth - (padding * 3) - mapSize; // Space left for text
    
    let totalLines = 0;
    const wrapData = [];

    stringsToDraw.forEach(([text, style, colorOverride]) => {
      let fontStr = '';
      if (style === 'bold') fontStr = `bold ${fontSize}px sans-serif`;
      else if (style === 'italic') fontStr = `italic ${fontSize * 0.9}px sans-serif`;
      else fontStr = `${fontSize}px sans-serif`;
      ctx.font = fontStr;
      
      const lines = [];
      const words = text.split(' ');
      let line = '';
      for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > textBoxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      totalLines += lines.length;
      wrapData.push({ lines, fontStr, color: colorOverride || textFill });
    });

    const boxHeight = Math.max(
      (totalLines * lineHeight) + (padding * 2) + (setts.template === 'detailed' ? fontSize * 1.5 : 0),
      mapSize + (padding * 2) // Maintain min height for map
    );
    const boxWidth = canvasWidth - (padding * 2);
    
    // Draw Box at bottom
    const boxY = canvasHeight - boxHeight - padding;
    const boxX = padding;

    // Draw rounded rect background
    ctx.fillStyle = bgFill;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, fontSize * 0.5);
    ctx.fill();

    // Draw text
    let currentY = boxY + padding + fontSize;
    wrapData.forEach(({ lines, fontStr, color }) => {
      ctx.fillStyle = color;
      ctx.font = fontStr;
      
      lines.forEach(line => {
        ctx.fillText(line, boxX + padding, currentY);
        currentY += lineHeight;
      });
    });

    // Add signature below text if detailed
    if (setts.template === 'detailed') {
      ctx.fillStyle = accentFill;
      ctx.font = `bold ${fontSize * 0.8}px sans-serif`;
      ctx.fillText('NLR -- Geo Tag Space', boxX + padding, canvasHeight - padding * 2);
    }

    // Draw Mini Map to the right
    try {
      const zoom = 14;
      const x = Math.floor((loc.lng + 180) / 360 * Math.pow(2, zoom));
      const y = Math.floor((1 - Math.log(Math.tan(loc.lat * Math.PI / 180) + 1 / Math.cos(loc.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      
      // Calculate offset inside the tile to draw the pin precisely
      const lon_width = 360.0 / Math.pow(2, zoom);
      const start_lon = -180.0 + x * lon_width;
      const x_offset = ((loc.lng - start_lon) / lon_width) * mapSize;

      const n = Math.PI - 2.0 * Math.PI * y / Math.pow(2, zoom);
      const start_lat = 180.0 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
      const next_n = Math.PI - 2.0 * Math.PI * (y + 1) / Math.pow(2, zoom);
      const end_lat = 180.0 / Math.PI * Math.atan(0.5 * (Math.exp(next_n) - Math.exp(-next_n)));
      
      const lat_height = start_lat - end_lat;
      const y_offset = ((start_lat - loc.lat) / lat_height) * mapSize;

      const tileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
      const mapImg = new Image();
      mapImg.crossOrigin = 'anonymous';
      
      mapImg.onload = () => {
        const mapX = canvasWidth - mapSize - padding * 2;
        const mapY = boxY + padding;

        ctx.strokeStyle = isDark ? '#374151' : '#e5e7eb';
        ctx.lineWidth = 4;
        ctx.strokeRect(mapX, mapY, mapSize, mapSize);

        ctx.drawImage(mapImg, mapX, mapY, mapSize, mapSize);

        // precise pin placement
        let pinX = mapX + x_offset;
        let pinY = mapY + y_offset;
        
        // clamp pin to map view
        pinX = Math.max(mapX, Math.min(mapX + mapSize, pinX));
        pinY = Math.max(mapY, Math.min(mapY + mapSize, pinY));

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(pinX, pinY, mapSize * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        try {
          const newDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
          setDownloadUrl(newDataUrl);
        } catch (e) {
          console.error("Canvas export failed after map added: ", e);
        }
      };
      
      mapImg.src = tileUrl;
    } catch (err) {
      console.error("Could not load map tile", err);
    }
  };

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px] border-2 border-dashed border-gray-700 rounded-xl text-gray-500">
        <p>Awaiting photo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-xl overflow-hidden bg-black flex justify-center items-center shadow-inner pt-2 pb-2 group">
        
        {isDrawing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin text-white w-8 h-8" />
          </div>
        )}
        
        <canvas 
          ref={canvasRef} 
          className="max-h-[500px] max-w-full object-contain rounded drop-shadow-lg"
          style={{ display: isDrawing ? 'none' : 'block' }}
        />
        
      </div>

      <a 
        href={downloadUrl}
        download={`geotag-${Date.now()}.jpg`}
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
          downloadUrl 
            ? 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 transform hover:-translate-y-1' 
            : 'bg-gray-600 cursor-not-allowed hidden'
        }`}
      >
        <Download size={20} />
        Download High-Res Image
      </a>
    </div>
  );
}
