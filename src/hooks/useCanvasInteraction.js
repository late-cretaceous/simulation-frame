import { useState, useEffect } from 'react';

/**
 * Hook for handling canvas panning, zooming, and selection
 */
const useCanvasInteraction = ({
  canvasRef,
  containerRef,
  minScale = 0.5,
  maxScale = 2.0,
  defaultScale = 1.0,
  onSelect,
  selectionEnabled = true
}) => {
  // Viewport state
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(defaultScale);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  
  // Center the viewport initially
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const initialX = (container.clientWidth / scale - container.clientWidth) / 2;
    const initialY = (container.clientHeight / scale - container.clientHeight) / 2;
    
    setViewportOffset({ x: initialX, y: initialY });
  }, [scale]);
  
  // Apply viewport transform when it changes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Apply DPI scaling if needed
    if (ctx.pixelRatio) {
      ctx.scale(ctx.pixelRatio, ctx.pixelRatio);
    }
    
    // Apply viewport transform
    ctx.translate(viewportOffset.x, viewportOffset.y);
    ctx.scale(scale, scale);
    
    // Store viewport info on context
    ctx.viewportOffset = viewportOffset;
    ctx.viewportScale = scale;
  }, [viewportOffset, scale]);
  
  // Reset viewport to center
  const resetViewport = () => {
    setScale(defaultScale);
    
    if (containerRef.current) {
      const container = containerRef.current;
      const initialX = (container.clientWidth / defaultScale - container.clientWidth) / 2;
      const initialY = (container.clientHeight / defaultScale - container.clientHeight) / 2;
      
      setViewportOffset({ x: initialX, y: initialY });
    }
  };
  
  // Handle mouse down to start dragging or selecting
  const handleMouseDown = (e) => {
    // Only primary mouse button (left click)
    if (e.button !== 0) return;
    
    // Start a potential selection or drag
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffset({ ...viewportOffset });
    
    // Reset movement flag
    setHasMoved(false);
    
    // Track if we're starting a selection or drag (we'll know on mouse move)
    setIsSelecting(true);
  };
  
  // Handle mouse move to update viewport while dragging
  const handleMouseMove = (e) => {
    if (!isDragging && isSelecting) {
      // Check if we've moved enough to consider this a drag
      const deltaX = Math.abs(e.clientX - dragStart.x);
      const deltaY = Math.abs(e.clientY - dragStart.y);
      
      // If moved more than 5 pixels, consider it a drag
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
        setHasMoved(true);
      }
    }
    
    // If dragging, update viewport
    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x);
      const deltaY = (e.clientY - dragStart.y);
      
      setViewportOffset({
        x: initialOffset.x + deltaX,
        y: initialOffset.y + deltaY
      });
    }
  };
  
  // Handle click for selection
  const handleClick = (e) => {
    // Only register clicks, not drags
    if (hasMoved || !selectionEnabled || !onSelect) return;
    
    // Get canvas rect for coordinate calculation
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate coordinates relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Call selection handler with coordinates and current viewport info
    onSelect(x, y, viewportOffset, scale);
  };
  
  // Handle mouse up to stop dragging and potentially select
  const handleMouseUp = (e) => {
    // Only register as a click if we haven't moved much
    if (isSelecting && !hasMoved) {
      handleClick(e);
    }
    
    // End dragging/selecting
    setIsDragging(false);
    setIsSelecting(false);
  };
  
  // Handle mouse leave to stop dragging
  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsSelecting(false);
  };
  
  // Handle mouse wheel to zoom in/out
  const handleWheel = (e) => {
    e.preventDefault();
    
    // Calculate new scale
    const zoomFactor = 0.1;
    const delta = e.deltaY < 0 ? zoomFactor : -zoomFactor;
    const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
    
    if (newScale !== scale) {
      // Calculate mouse position relative to canvas
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate old world position
      const worldX = (mouseX - viewportOffset.x) / scale;
      const worldY = (mouseY - viewportOffset.y) / scale;
      
      // Calculate new viewport offset to keep mouse position fixed
      const newOffsetX = mouseX - worldX * newScale;
      const newOffsetY = mouseY - worldY * newScale;
      
      // Update state
      setScale(newScale);
      setViewportOffset({ x: newOffsetX, y: newOffsetY });
    }
  };
  
  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Single touch for panning
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setInitialOffset({ ...viewportOffset });
      setIsSelecting(true);
      setHasMoved(false);
    }
  };
  
  // Touch move handler
  const handleTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    
    if (!isDragging && isSelecting) {
      // Check if we've moved enough to consider this a drag
      const deltaX = Math.abs(touch.clientX - dragStart.x);
      const deltaY = Math.abs(touch.clientY - dragStart.y);
      
      // If moved more than 10 pixels, consider it a drag (larger threshold for touch)
      if (deltaX > 10 || deltaY > 10) {
        setIsDragging(true);
        setHasMoved(true);
      }
    }
    
    if (isDragging) {
      const deltaX = (touch.clientX - dragStart.x);
      const deltaY = (touch.clientY - dragStart.y);
      
      setViewportOffset({
        x: initialOffset.x + deltaX,
        y: initialOffset.y + deltaY
      });
    }
  };
  
  // Handle touch end for selection
  const handleTouchEnd = (e) => {
    // If it was a tap (not a drag), try to select organism
    if (isSelecting && !hasMoved && selectionEnabled && onSelect) {
      // Get the last touch position
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const rect = canvasRef.current.getBoundingClientRect();
        
        // Call the selection handler with canvas coordinates
        onSelect(
          touch.clientX - rect.left, 
          touch.clientY - rect.top,
          viewportOffset,
          scale
        );
      }
    }
    
    // End dragging/selecting
    setIsDragging(false);
    setIsSelecting(false);
  };
  
  return {
    viewportOffset,
    scale,
    setScale,
    resetViewport,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

export default useCanvasInteraction;