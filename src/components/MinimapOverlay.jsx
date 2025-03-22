import React, { useRef, useEffect } from 'react';
import { DEFAULT_MINIMAP_SIZE } from '../utils/constants';

/**
 * A performance-optimized minimap overlay that shows entity positions
 */
const MinimapOverlay = ({ 
  canvasRef, 
  viewportOffset = { x: 0, y: 0 }, 
  viewportScale = 1, 
  organismPositions = [], 
  foodPositions = [],
  worldWidth = 1600,
  worldHeight = 1000,
  minimapSize = DEFAULT_MINIMAP_SIZE
}) => {
  const minimapRef = useRef(null);
  
  useEffect(() => {
    if (!minimapRef.current) return;
    
    const minimap = minimapRef.current;
    const ctx = minimap.getContext('2d');
    
    // Clear previous frame
    ctx.clearRect(0, 0, minimapSize, minimapSize);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 20, 0.7)';
    ctx.fillRect(0, 0, minimapSize, minimapSize);
    
    // Calculate map scale
    const mapScale = minimapSize / Math.max(worldWidth, worldHeight);
    
    // Draw simulation area boundary
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, worldWidth * mapScale, worldHeight * mapScale);
    
    // Calculate viewport dimensions
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      
      // Draw viewport rectangle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        -viewportOffset.x * mapScale / viewportScale,
        -viewportOffset.y * mapScale / viewportScale,
        canvasWidth * mapScale / viewportScale,
        canvasHeight * mapScale / viewportScale
      );
    }
    
    // Limit the number of dots to draw for performance
    const maxDots = 150; // Reduced for better performance
    
    // Draw organisms as tiny dots with batching for performance
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.beginPath();
    
    organismPositions.slice(0, maxDots).forEach(pos => {
      const x = pos.x * mapScale;
      const y = pos.y * mapScale;
      
      if (x >= 0 && x <= minimapSize && y >= 0 && y <= minimapSize) {
        ctx.rect(x - 0.75, y - 0.75, 1.5, 1.5);
      }
    });
    
    ctx.fill();
    
    // Draw food as tiny dots with batching for performance
    ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.beginPath();
    
    foodPositions.slice(0, maxDots).forEach(pos => {
      const x = pos.x * mapScale;
      const y = pos.y * mapScale;
      
      if (x >= 0 && x <= minimapSize && y >= 0 && y <= minimapSize) {
        ctx.rect(x - 0.5, y - 0.5, 1, 1);
      }
    });
    
    ctx.fill();
    
  }, [canvasRef, viewportOffset, viewportScale, organismPositions, foodPositions, worldWidth, worldHeight, minimapSize]);
  
  return (
    <div className="minimap-container">
      <canvas
        ref={minimapRef}
        width={minimapSize}
        height={minimapSize}
        className="minimap-canvas"
      />
    </div>
  );
};

export default MinimapOverlay;