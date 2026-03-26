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
    const secondaryFill = isDark ? '#d1d5db' : '#4b5563';
    const accentFill = '#3b82f6'; // blue-500

    // Dynamic sizing to strictly keep overlay compact
    const minDim = Math.min(canvasWidth, canvasHeight);
    const baseFontSize = Math.max(12, Math.floor(minDim * 0.035)); // Scaled based on height/width ratio
    const padding = Math.max(12, Math.floor(baseFontSize * 0.8));
    const mapSize = Math.max(80, Math.min(180, canvasWidth * 0.22)); // Max 180px or 22% of width
    
    // Let the canvas wrap logic handle the long address instead of cutting it
    // The user wants more information to be visible!
    let displayAddress = loc.address || 'Unknown Location';
    
    const formattedDate = format(new Date(setts.datetime), 'dd MMM yyyy, HH:mm:ss');
    const geoText = `Lat: ${loc.lat.toFixed(6)}  Lng: ${loc.lng.toFixed(6)}`;
    
    let stringsToDraw = [];
    
    if (setts.template === 'minimal') {
      stringsToDraw.push([geoText, 'bold']);
      stringsToDraw.push([displayAddress, 'normal']);
    } else if (setts.template === 'satellite') {
      stringsToDraw.push([geoText, 'bold', accentFill]);
      stringsToDraw.push([formattedDate, 'normal']);
    } else {
      // detailed
      stringsToDraw.push([geoText, 'bold']);
      stringsToDraw.push([displayAddress, 'normal']);
      stringsToDraw.push([formattedDate, 'normal', secondaryFill]);
      if (setts.customText) {
        stringsToDraw.push([setts.customText, 'italic', accentFill]);
      }
    }

    const textBoxWidth = canvasWidth - (padding * 3) - mapSize; // Space left for text
    let totalLines = 0;
    const wrapData = [];

    stringsToDraw.forEach(([text, style, colorOverride]) => {
      let fontStr = '';
      let specificFontSize = baseFontSize;
      let lineHeightMultiplier = 1.3;

      if (style === 'bold') {
        fontStr = `bold ${baseFontSize}px sans-serif`;
      } else if (style === 'italic') {
        specificFontSize = baseFontSize * 0.85;
        fontStr = `italic ${specificFontSize}px sans-serif`;
      } else {
        specificFontSize = baseFontSize * 0.85; // Address / Date should be 15% smaller
        fontStr = `${specificFontSize}px sans-serif`;
        lineHeightMultiplier = 1.25;
      }
      
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
      totalLines += lines.length * lineHeightMultiplier;
      wrapData.push({ lines, fontStr, color: colorOverride || textFill, specificFontSize, lineHeightMultiplier });
    });

    const boxHeight = Math.max(
      (totalLines * baseFontSize) + (padding * 2.5) + (setts.template === 'detailed' ? baseFontSize * 1.5 : 0),
      mapSize + (padding * 2) 
    );
    const boxWidth = canvasWidth - (padding * 2);
    
    // Draw Box at bottom left corner
    const boxY = canvasHeight - boxHeight - padding;
    const boxX = padding;

    // Draw rounded rect background
    ctx.fillStyle = bgFill;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, baseFontSize * 0.5);
    ctx.fill();

    // Draw text
    let currentY = boxY + padding + baseFontSize;
    wrapData.forEach(({ lines, fontStr, color, specificFontSize, lineHeightMultiplier }) => {
      ctx.fillStyle = color;
      ctx.font = fontStr;
      
      lines.forEach(line => {
        ctx.fillText(line, boxX + padding, currentY);
        currentY += specificFontSize * lineHeightMultiplier;
      });
    });

    // Add signature below text if detailed
    if (setts.template === 'detailed') {
      ctx.fillStyle = accentFill;
      ctx.font = `bold ${baseFontSize * 0.75}px sans-serif`;
      ctx.fillText('NLR -- Geo Tag Space', boxX + padding, canvasHeight - padding * 1.5);
    }

    // Draw Mini Map to the right
    try {
      const zoom = 14;
      const n = Math.pow(2, zoom);
      const globalX = ((loc.lng + 180) / 360) * n;
      const latRad = loc.lat * Math.PI / 180;
      const globalY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;

      const tileX = Math.floor(globalX);
      const tileY = Math.floor(globalY);
      
      const fractionX = globalX - tileX;
      const fractionY = globalY - tileY;

      const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
      const mapImg = new Image();
      mapImg.crossOrigin = 'anonymous';
      
      mapImg.onload = () => {
        const mapX = canvasWidth - mapSize - padding * 2;
        const mapY = boxY + padding;

        ctx.strokeStyle = isDark ? '#374151' : '#e5e7eb';
        ctx.lineWidth = 4;
        ctx.strokeRect(mapX, mapY, mapSize, mapSize);

        ctx.drawImage(mapImg, mapX, mapY, mapSize, mapSize);

        // precise pin placement using perfectly scaled tile fractions
        let pinX = mapX + fractionX * mapSize;
        let pinY = mapY + fractionY * mapSize;
        
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
