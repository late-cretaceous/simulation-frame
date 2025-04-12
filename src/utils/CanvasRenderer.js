/**
 * ImprovedCanvasRenderer
 * 
 * Enhanced canvas rendering utility with comprehensive drawing methods,
 * error handling, high-DPI support, and automatic viewport management.
 * 
 * Features:
 * - Complete set of drawing primitives (circle, rect, line, polygon, etc.)
 * - Automatic handling of high-DPI displays
 * - Viewport transformation management
 * - Error recovery for drawing operations
 * - Performance optimizations (batching, culling)
 * - Debug visualization options
 */

export class ImprovedCanvasRenderer {
  /**
   * Create a new canvas renderer
   * @param {HTMLCanvasElement} canvas - The canvas element
   * @param {CanvasRenderingContext2D} context - The canvas context (optional, will be created if not provided)
   * @param {Object} options - Configuration options
   */
  constructor(canvas, context = null, options = {}) {
    // Store canvas reference
    this.canvas = canvas;
    
    // Default options
    this.options = {
      highDPI: true,          // Enable high-DPI rendering
      autoClear: true,        // Automatically clear canvas on beginFrame
      culling: true,          // Enable culling of off-screen objects
      errorRecovery: true,    // Enable error recovery for drawing operations
      debugMode: false,       // Debug mode shows additional visual information
      pixelRatio: null,       // Pixel ratio (auto-detected if null)
      ...options
    };
    
    // Get or create context
    this.context = context || canvas.getContext('2d');
    
    // Viewport state
    this.viewportOffset = { x: 0, y: 0 };
    this.viewportScale = 1.0;
    
    // State tracking
    this._frameInProgress = false;
    this._objectsDrawn = 0;
    this._drawCalls = 0;
    this._skippedDraws = 0;
    this._errors = [];
    this._maxErrors = 100;
    this._lastError = null;
    
    // Performance tracking
    this._performanceData = {
      frameStartTime: 0,
      lastFrameTime: 0,
      averageFrameTime: 0,
      framesTracked: 0,
      maxFrameTime: 0
    };
    
    // Initialize pixel ratio
    this._setupPixelRatio();
    
    // Initialize canvas
    this._setupCanvas();
  }
  
  /**
   * Set up the pixel ratio for high-DPI support
   * @private
   */
  _setupPixelRatio() {
    // Use provided pixel ratio or detect from device
    this.pixelRatio = this.options.pixelRatio || window.devicePixelRatio || 1;
    
    // Cap pixel ratio to avoid performance issues on very high-DPI displays
    this.pixelRatio = Math.min(this.pixelRatio, 3);
    
    // Disable high-DPI if specified in options
    if (!this.options.highDPI) {
      this.pixelRatio = 1;
    }
  }
  
  /**
   * Set up canvas for proper rendering
   * @private
   */
  _setupCanvas() {
    // Store original dimensions
    this.canvasWidth = this.canvas.clientWidth || this.canvas.width;
    this.canvasHeight = this.canvas.clientHeight || this.canvas.height;
    
    // Apply high-DPI scaling if enabled
    if (this.pixelRatio > 1) {
      // Set canvas dimensions accounting for pixel ratio
      this.canvas.width = this.canvasWidth * this.pixelRatio;
      this.canvas.height = this.canvasHeight * this.pixelRatio;
      
      // Set display size through CSS
      this.canvas.style.width = this.canvasWidth + 'px';
      this.canvas.style.height = this.canvasHeight + 'px';
      
      // Apply initial scale to context
      this.context.scale(this.pixelRatio, this.pixelRatio);
    } else {
      // Set canvas dimensions directly
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;
    }
    
    // Add pixel ratio to context for other code to use
    this.context.pixelRatio = this.pixelRatio;
  }
  
  /**
   * Resize the canvas to match container size
   * @param {number} width - New width (optional, uses container width if not provided)
   * @param {number} height - New height (optional, uses container height if not provided)
   */
  resize(width = null, height = null) {
    try {
      // End frame if one is in progress
      if (this._frameInProgress) {
        this.endFrame();
      }
      
      // Get dimensions from parameters or container
      const newWidth = width || this.canvas.clientWidth;
      const newHeight = height || this.canvas.clientHeight;
      
      // Update stored dimensions
      this.canvasWidth = newWidth;
      this.canvasHeight = newHeight;
      
      // Update canvas dimensions
      if (this.pixelRatio > 1) {
        // Set canvas dimensions accounting for pixel ratio
        this.canvas.width = this.canvasWidth * this.pixelRatio;
        this.canvas.height = this.canvasHeight * this.pixelRatio;
        
        // Set display size through CSS
        this.canvas.style.width = this.canvasWidth + 'px';
        this.canvas.style.height = this.canvasHeight + 'px';
        
        // Reset scale for high-DPI
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(this.pixelRatio, this.pixelRatio);
      } else {
        // Set canvas dimensions directly
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
      }
      
      // Apply viewport transform
      this._applyViewportTransform();
    } catch (error) {
      this._trackError('resize', error);
    }
  }
  
  /**
   * Set the viewport transformation
   * @param {Object} offset - Viewport offset {x, y}
   * @param {number} scale - Viewport scale
   */
  setViewport(offset, scale) {
    this.viewportOffset = offset || { x: 0, y: 0 };
    this.viewportScale = scale || 1.0;
    
    // Apply the new viewport transform if not in a frame
    if (!this._frameInProgress) {
      this._applyViewportTransform();
    }
  }
  
  /**
   * Apply viewport transformation to context
   * @private
   */
  _applyViewportTransform() {
    try {
      // Reset transformation to identity (accounting for pixel ratio)
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      
      // Apply high-DPI scaling if enabled
      if (this.pixelRatio > 1) {
        this.context.scale(this.pixelRatio, this.pixelRatio);
      }
      
      // Apply viewport transform
      this.context.translate(this.viewportOffset.x, this.viewportOffset.y);
      this.context.scale(this.viewportScale, this.viewportScale);
      
      // Store viewport info on context
      this.context.viewportOffset = { ...this.viewportOffset };
      this.context.viewportScale = this.viewportScale;
    } catch (error) {
      this._trackError('apply-viewport', error);
    }
  }
  
  /**
   * Clear the entire canvas
   */
  clear() {
    try {
      // Save current transformation
      this.context.save();
      
      // Reset transformation to identity
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      
      // Clear entire canvas (using actual pixel dimensions)
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Restore transformation
      this.context.restore();
    } catch (error) {
      this._trackError('clear', error);
      
      // Fallback clear attempt if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          // Simple direct clear
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } catch (fallbackError) {
          this._trackError('clear-fallback', fallbackError);
        }
      }
    }
  }
  
  /**
   * Begin a new frame (clear canvas and apply viewport)
   */
  beginFrame() {
    try {
      // Track performance
      this._performanceData.frameStartTime = performance.now();
      
      // Clear canvas if auto-clear is enabled
      if (this.options.autoClear) {
        this.clear();
      }
      
      // Apply viewport transform
      this._applyViewportTransform();
      
      // Reset frame statistics
      this._objectsDrawn = 0;
      this._drawCalls = 0;
      this._skippedDraws = 0;
      
      // Mark frame as in progress
      this._frameInProgress = true;
    } catch (error) {
      this._trackError('begin-frame', error);
    }
  }
  
  /**
   * End the current frame
   */
  endFrame() {
    if (!this._frameInProgress) return;
    
    try {
      // Mark frame as complete
      this._frameInProgress = false;
      
      // Draw debug info if enabled
      if (this.options.debugMode) {
        this._drawDebugInfo();
      }
      
      // Update performance tracking
      const frameTime = performance.now() - this._performanceData.frameStartTime;
      this._performanceData.lastFrameTime = frameTime;
      this._performanceData.maxFrameTime = Math.max(this._performanceData.maxFrameTime, frameTime);
      
      // Update average (with simple moving average)
      this._performanceData.framesTracked++;
      if (this._performanceData.framesTracked === 1) {
        this._performanceData.averageFrameTime = frameTime;
      } else {
        // Weight new frames more heavily in the average (90% old, 10% new)
        this._performanceData.averageFrameTime = 
          this._performanceData.averageFrameTime * 0.9 + frameTime * 0.1;
      }
    } catch (error) {
      this._trackError('end-frame', error);
    }
  }
  
  /**
   * Check if an object is visible in the current viewport
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Object radius or half-width/height
   * @returns {boolean} - True if object is visible
   * @private
   */
  _isVisible(x, y, radius) {
    if (!this.options.culling) return true;
    
    try {
      // Convert world to screen coordinates
      const screenX = x * this.viewportScale + this.viewportOffset.x;
      const screenY = y * this.viewportScale + this.viewportOffset.y;
      const screenRadius = radius * this.viewportScale;
      
      // Add margin to visible area
      const margin = 100; // pixels
      
      // Check if within visible area (with margin)
      return screenX + screenRadius >= -margin &&
             screenX - screenRadius <= this.canvasWidth + margin &&
             screenY + screenRadius >= -margin &&
             screenY - screenRadius <= this.canvasHeight + margin;
    } catch (error) {
      this._trackError('visibility-check', error);
      return true; // Default to visible on error
    }
  }
  
  /**
   * Track an error
   * @param {string} source - Error source
   * @param {Error} error - Error object
   * @private
   */
  _trackError(source, error) {
    // Create error info object
    const errorInfo = {
      source,
      message: error.message || String(error),
      stack: error.stack,
      time: new Date()
    };
    
    // Store as last error
    this._lastError = errorInfo;
    
    // Add to errors array
    this._errors.push(errorInfo);
    
    // Limit errors array
    if (this._errors.length > this._maxErrors) {
      this._errors.shift();
    }
    
    // Log error
    console.error(`[CanvasRenderer] Error in ${source}:`, error);
  }
  
  /**
   * Draw debug information
   * @private
   */
  _drawDebugInfo() {
    try {
      // Save context state
      this.context.save();
      
      // Reset to screen space
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      
      if (this.pixelRatio > 1) {
        this.context.scale(this.pixelRatio, this.pixelRatio);
      }
      
      // Draw background
      this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.context.fillRect(10, 10, 180, 120);
      
      // Draw debug text
      this.context.font = '12px monospace';
      this.context.fillStyle = 'white';
      this.context.textAlign = 'left';
      this.context.textBaseline = 'top';
      
      let y = 20;
      this.context.fillText(`Objects: ${this._objectsDrawn}`, 20, y); y += 20;
      this.context.fillText(`Draw calls: ${this._drawCalls}`, 20, y); y += 20;
      this.context.fillText(`Skipped: ${this._skippedDraws}`, 20, y); y += 20;
      this.context.fillText(`Frame: ${this._performanceData.lastFrameTime.toFixed(2)}ms`, 20, y); y += 20;
      this.context.fillText(`Avg: ${this._performanceData.averageFrameTime.toFixed(2)}ms`, 20, y); y += 20;
      
      // FPS indicator
      const fps = 1000 / this._performanceData.lastFrameTime;
      let fpsColor;
      
      if (fps >= 55) {
        fpsColor = 'rgb(0, 255, 0)'; // Green for good FPS
      } else if (fps >= 30) {
        fpsColor = 'rgb(255, 255, 0)'; // Yellow for OK FPS
      } else {
        fpsColor = 'rgb(255, 0, 0)'; // Red for poor FPS
      }
      
      this.context.fillStyle = fpsColor;
      this.context.fillText(`FPS: ${fps.toFixed(1)}`, 20, y);
      
      // Draw errors if any
      if (this._errors.length > 0) {
        const lastError = this._errors[this._errors.length - 1];
        this.context.fillStyle = 'rgb(255, 100, 100)';
        this.context.fillText(`Last error: ${lastError.source}`, 20, 140);
        this.context.fillText(`${lastError.message.substring(0, 30)}`, 20, 160);
      }
      
      // Restore context
      this.context.restore();
    } catch (error) {
      console.error('Error drawing debug info:', error);
    }
  }
  
  // =========================================
  // DRAWING PRIMITIVES
  // =========================================
  
  /**
   * Draw a circle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Circle radius
   * @param {string|Object} fill - Fill color or style object
   * @param {string} [stroke] - Stroke color (optional)
   * @param {number} [lineWidth] - Stroke width (optional)
   */
  drawCircle(x, y, radius, fill, stroke = null, lineWidth = 1) {
    // Skip if not visible
    if (!this._isVisible(x, y, radius)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      this.context.beginPath();
      this.context.arc(x, y, radius, 0, Math.PI * 2);
      
      // Apply fill if provided
      if (fill) {
        this.context.fillStyle = fill;
        this.context.fill();
      }
      
      // Apply stroke if provided
      if (stroke) {
        this.context.strokeStyle = stroke;
        this.context.lineWidth = lineWidth;
        this.context.stroke();
      }
    } catch (error) {
      this._trackError('draw-circle', error);
      
      // Basic fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          this.context.beginPath();
          this.context.arc(x, y, radius, 0, Math.PI * 2);
          this.context.fillStyle = 'red'; // Fallback color
          this.context.fill();
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw a rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {string|Object} fill - Fill color or style object
   * @param {string} [stroke] - Stroke color (optional)
   * @param {number} [lineWidth] - Stroke width (optional)
   */
  drawRect(x, y, width, height, fill, stroke = null, lineWidth = 1) {
    // Skip if not visible
    const radius = Math.max(width, height) / 2;
    if (!this._isVisible(x + width/2, y + height/2, radius)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      // Apply fill if provided
      if (fill) {
        this.context.fillStyle = fill;
        this.context.fillRect(x, y, width, height);
      }
      
      // Apply stroke if provided
      if (stroke) {
        this.context.strokeStyle = stroke;
        this.context.lineWidth = lineWidth;
        this.context.strokeRect(x, y, width, height);
      }
    } catch (error) {
      this._trackError('draw-rect', error);
      
      // Basic fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          this.context.fillStyle = 'red'; // Fallback color
          this.context.fillRect(x, y, width, height);
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw a line
   * @param {number} x1 - Start X position
   * @param {number} y1 - Start Y position
   * @param {number} x2 - End X position
   * @param {number} y2 - End Y position
   * @param {string} color - Line color
   * @param {number} [width] - Line width
   * @param {string} [dashPattern] - Dash pattern (optional)
   */
  drawLine(x1, y1, x2, y2, color, width = 1, dashPattern = null) {
    // Calculate line midpoint and length for culling
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // Skip if not visible
    if (!this._isVisible(midX, midY, length / 2)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      this.context.beginPath();
      
      // Apply dash pattern if provided
      if (dashPattern) {
        if (typeof dashPattern === 'string') {
          // Parse string like "5,10"
          const pattern = dashPattern.split(',').map(Number);
          this.context.setLineDash(pattern);
        } else if (Array.isArray(dashPattern)) {
          this.context.setLineDash(dashPattern);
        }
      }
      
      // Set line style
      this.context.strokeStyle = color;
      this.context.lineWidth = width;
      
      // Draw line
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.stroke();
      
      // Reset dash pattern
      if (dashPattern) {
        this.context.setLineDash([]);
      }
    } catch (error) {
      this._trackError('draw-line', error);
      
      // Basic fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          this.context.beginPath();
          this.context.strokeStyle = 'red'; // Fallback color
          this.context.lineWidth = width;
          this.context.moveTo(x1, y1);
          this.context.lineTo(x2, y2);
          this.context.stroke();
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw a polygon
   * @param {Array} points - Array of {x, y} points
   * @param {string|Object} fill - Fill color or style object
   * @param {string} [stroke] - Stroke color (optional)
   * @param {number} [lineWidth] - Stroke width (optional)
   */
  drawPolygon(points, fill, stroke = null, lineWidth = 1) {
    if (!points || points.length < 3) return;
    
    // Calculate bounding box for culling
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radius = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2)) / 2;
    
    // Skip if not visible
    if (!this._isVisible(centerX, centerY, radius)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      this.context.beginPath();
      this.context.moveTo(points[0].x, points[0].y);
      
      // Draw polygon path
      for (let i = 1; i < points.length; i++) {
        this.context.lineTo(points[i].x, points[i].y);
      }
      
      // Close path
      this.context.closePath();
      
      // Apply fill if provided
      if (fill) {
        this.context.fillStyle = fill;
        this.context.fill();
      }
      
      // Apply stroke if provided
      if (stroke) {
        this.context.strokeStyle = stroke;
        this.context.lineWidth = lineWidth;
        this.context.stroke();
      }
    } catch (error) {
      this._trackError('draw-polygon', error);
      
      // Simplified fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          // Draw as a rectangle fallback
          this.context.fillStyle = 'red'; // Fallback color
          this.context.fillRect(minX, minY, maxX - minX, maxY - minY);
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw text
   * @param {string} text - Text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} color - Text color
   * @param {string} [font] - Font settings (optional)
   * @param {string} [align] - Text alignment (optional)
   * @param {string} [baseline] - Text baseline (optional)
   */
  drawText(text, x, y, color, font = '12px sans-serif', align = 'left', baseline = 'top') {
    // Calculate approximate text width for culling (very rough estimate)
    const textLength = text.length;
    const estimatedWidth = textLength * 8; // Rough estimate: 8px per character
    
    // Skip if not visible
    if (!this._isVisible(x, y, estimatedWidth / 2)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      // Set text properties
      this.context.font = font;
      this.context.fillStyle = color;
      this.context.textAlign = align;
      this.context.textBaseline = baseline;
      
      // Draw text
      this.context.fillText(text, x, y);
    } catch (error) {
      this._trackError('draw-text', error);
      
      // Simplified fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          this.context.font = '12px sans-serif'; // Default font
          this.context.fillStyle = 'red'; // Fallback color
          this.context.textAlign = 'left';
          this.context.textBaseline = 'top';
          this.context.fillText(text, x, y);
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw an image
   * @param {HTMLImageElement|HTMLCanvasElement} image - Image to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} [width] - Width (optional, uses image width if not provided)
   * @param {number} [height] - Height (optional, uses image height if not provided)
   */
  drawImage(image, x, y, width = null, height = null) {
    // Use image dimensions if not provided
    const w = width || image.width;
    const h = height || image.height;
    
    // Skip if not visible
    if (!this._isVisible(x + w/2, y + h/2, Math.max(w, h) / 2)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      // Draw image
      if (width !== null && height !== null) {
        this.context.drawImage(image, x, y, width, height);
      } else {
        this.context.drawImage(image, x, y);
      }
    } catch (error) {
      this._trackError('draw-image', error);
      
      // Simplified fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          // Draw placeholder rectangle
          this.context.fillStyle = 'rgba(255, 0, 0, 0.5)';
          this.context.fillRect(x, y, w, h);
          
          // Draw X through rectangle
          this.context.strokeStyle = 'red';
          this.context.lineWidth = 2;
          this.context.beginPath();
          this.context.moveTo(x, y);
          this.context.lineTo(x + w, y + h);
          this.context.moveTo(x + w, y);
          this.context.lineTo(x, y + h);
          this.context.stroke();
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw a sprite with rotation and scale
   * @param {HTMLImageElement|HTMLCanvasElement} image - Image to draw
   * @param {number} x - X position (center of sprite)
   * @param {number} y - Y position (center of sprite)
   * @param {number} width - Width to draw
   * @param {number} height - Height to draw
   * @param {number} rotation - Rotation in radians
   * @param {number} [scale] - Scale factor (default: 1.0)
   */
  drawSprite(image, x, y, width, height, rotation = 0, scale = 1.0) {
    // Calculate scaled dimensions
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    // Skip if not visible
    const radius = Math.sqrt(scaledWidth * scaledWidth + scaledHeight * scaledHeight) / 2;
    if (!this._isVisible(x, y, radius)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      // Save context state
      this.context.save();
      
      // Translate to center, rotate, and scale
      this.context.translate(x, y);
      this.context.rotate(rotation);
      this.context.scale(scale, scale);
      
      // Draw centered image
      this.context.drawImage(image, -width / 2, -height / 2, width, height);
      
      // Restore context state
      this.context.restore();
    } catch (error) {
      this._trackError('draw-sprite', error);
      
      // Simplified fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          // Save context state
          this.context.save();
          
          // Translate to center, don't rotate for simplicity
          this.context.translate(x, y);
          
          // Draw placeholder
          this.context.fillStyle = 'rgba(255, 0, 0, 0.5)';
          this.context.fillRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
          
          // Restore context state
          this.context.restore();
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw a path
   * @param {Array} points - Array of {x, y} points
   * @param {string} color - Stroke color
   * @param {number} [lineWidth] - Line width (default: 1)
   * @param {boolean} [closed] - Whether to close the path (default: false)
   * @param {string|Array} [dashPattern] - Dash pattern (optional)
   */
  drawPath(points, color, lineWidth = 1, closed = false, dashPattern = null) {
    if (!points || points.length < 2) return;
    
    // Calculate bounding box for culling
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radius = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2)) / 2;
    
    // Skip if not visible
    if (!this._isVisible(centerX, centerY, radius)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      this.context.beginPath();
      
      // Apply dash pattern if provided
      if (dashPattern) {
        if (typeof dashPattern === 'string') {
          // Parse string like "5,10"
          const pattern = dashPattern.split(',').map(Number);
          this.context.setLineDash(pattern);
        } else if (Array.isArray(dashPattern)) {
          this.context.setLineDash(dashPattern);
        }
      }
      
      // Set line style
      this.context.strokeStyle = color;
      this.context.lineWidth = lineWidth;
      
      // Draw path
      this.context.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.context.lineTo(points[i].x, points[i].y);
      }
      
      // Close path if requested
      if (closed) {
        this.context.closePath();
      }
      
      // Stroke path
      this.context.stroke();
      
      // Reset dash pattern
      if (dashPattern) {
        this.context.setLineDash([]);
      }
    } catch (error) {
      this._trackError('draw-path', error);
      
      // Simplified fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          // Draw simplified path
          this.context.beginPath();
          this.context.strokeStyle = 'red'; // Fallback color
          this.context.lineWidth = lineWidth;
          this.context.moveTo(points[0].x, points[0].y);
          
          // Just draw straight to the last point
          this.context.lineTo(points[points.length - 1].x, points[points.length - 1].y);
          this.context.stroke();
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw an arc
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} radius - Arc radius
   * @param {number} startAngle - Start angle in radians
   * @param {number} endAngle - End angle in radians
   * @param {string} color - Stroke color
   * @param {number} [lineWidth] - Line width (default: 1)
   * @param {boolean} [anticlockwise] - Whether to draw anti-clockwise (default: false)
   */
  drawArc(x, y, radius, startAngle, endAngle, color, lineWidth = 1, anticlockwise = false) {
    // Skip if not visible
    if (!this._isVisible(x, y, radius)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      this.context.beginPath();
      this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      
      // Set line style
      this.context.strokeStyle = color;
      this.context.lineWidth = lineWidth;
      
      // Stroke arc
      this.context.stroke();
    } catch (error) {
      this._trackError('draw-arc', error);
      
      // Simplified fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          this.context.beginPath();
          this.context.arc(x, y, radius, 0, Math.PI * 2); // Full circle fallback
          this.context.strokeStyle = 'red'; // Fallback color
          this.context.lineWidth = lineWidth;
          this.context.stroke();
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Fill an arc/wedge
   * @param {number} x - Center X position
   * @param {number} y - Center Y position
   * @param {number} radius - Arc radius
   * @param {number} startAngle - Start angle in radians
   * @param {number} endAngle - End angle in radians
   * @param {string} fill - Fill color
   * @param {string} [stroke] - Stroke color (optional)
   * @param {number} [lineWidth] - Stroke width (default: 1)
   * @param {boolean} [anticlockwise] - Whether to draw anti-clockwise (default: false)
   */
  fillArc(x, y, radius, startAngle, endAngle, fill, stroke = null, lineWidth = 1, anticlockwise = false) {
    // Skip if not visible
    if (!this._isVisible(x, y, radius)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      this.context.beginPath();
      this.context.moveTo(x, y); // Start at center
      this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      this.context.closePath();
      
      // Apply fill
      this.context.fillStyle = fill;
      this.context.fill();
      
      // Apply stroke if provided
      if (stroke) {
        this.context.strokeStyle = stroke;
        this.context.lineWidth = lineWidth;
        this.context.stroke();
      }
    } catch (error) {
      this._trackError('fill-arc', error);
      
      // Simplified fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          this.context.beginPath();
          this.context.moveTo(x, y);
          this.context.arc(x, y, radius, 0, Math.PI * 2); // Full circle fallback
          this.context.fillStyle = 'red'; // Fallback color
          this.context.fill();
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  /**
   * Draw a rounded rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   * @param {string} fill - Fill color
   * @param {string} [stroke] - Stroke color (optional)
   * @param {number} [lineWidth] - Stroke width (default: 1)
   */
  drawRoundRect(x, y, width, height, radius, fill, stroke = null, lineWidth = 1) {
    // Ensure radius isn't too large
    const maxRadius = Math.min(width, height) / 2;
    radius = Math.min(radius, maxRadius);
    
    // Skip if not visible
    if (!this._isVisible(x + width/2, y + height/2, Math.max(width, height) / 2)) {
      this._skippedDraws++;
      return;
    }
    
    try {
      this._drawCalls++;
      this._objectsDrawn++;
      
      this.context.beginPath();
      
      // Draw rounded rectangle path
      this.context.moveTo(x + radius, y);
      this.context.lineTo(x + width - radius, y);
      this.context.arcTo(x + width, y, x + width, y + radius, radius);
      this.context.lineTo(x + width, y + height - radius);
      this.context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      this.context.lineTo(x + radius, y + height);
      this.context.arcTo(x, y + height, x, y + height - radius, radius);
      this.context.lineTo(x, y + radius);
      this.context.arcTo(x, y, x + radius, y, radius);
      this.context.closePath();
      
      // Apply fill
      this.context.fillStyle = fill;
      this.context.fill();
      
      // Apply stroke if provided
      if (stroke) {
        this.context.strokeStyle = stroke;
        this.context.lineWidth = lineWidth;
        this.context.stroke();
      }
    } catch (error) {
      this._trackError('draw-round-rect', error);
      
      // Simplified fallback if error recovery is enabled
      if (this.options.errorRecovery) {
        try {
          // Draw regular rectangle as fallback
          this.context.fillStyle = 'red'; // Fallback color
          this.context.fillRect(x, y, width, height);
        } catch (fallbackError) {
          // Second fallback failed, stop trying
        }
      }
    }
  }
  
  // =========================================
  // COORDINATE CONVERSION METHODS
  // =========================================
  
  /**
   * Convert screen coordinates to world coordinates
   * @param {number} screenX - X coordinate in screen space
   * @param {number} screenY - Y coordinate in screen space
   * @returns {Object} - Coordinates in world space {x, y}
   */
  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.viewportOffset.x) / this.viewportScale,
      y: (screenY - this.viewportOffset.y) / this.viewportScale
    };
  }
  
  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - X coordinate in world space
   * @param {number} worldY - Y coordinate in world space
   * @returns {Object} - Coordinates in screen space {x, y}
   */
  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.viewportScale + this.viewportOffset.x,
      y: worldY * this.viewportScale + this.viewportOffset.y
    };
  }
  
  /**
   * Check if a point is inside a circle
   * @param {number} pointX - Point X coordinate
   * @param {number} pointY - Point Y coordinate
   * @param {number} circleX - Circle center X coordinate
   * @param {number} circleY - Circle center Y coordinate
   * @param {number} radius - Circle radius
   * @returns {boolean} - True if point is inside the circle
   */
  isPointInCircle(pointX, pointY, circleX, circleY, radius) {
    const dx = pointX - circleX;
    const dy = pointY - circleY;
    return dx * dx + dy * dy <= radius * radius;
  }
  
  /**
   * Check if a point is inside a rectangle
   * @param {number} pointX - Point X coordinate
   * @param {number} pointY - Point Y coordinate
   * @param {number} rectX - Rectangle X coordinate
   * @param {number} rectY - Rectangle Y coordinate
   * @param {number} rectWidth - Rectangle width
   * @param {number} rectHeight - Rectangle height
   * @returns {boolean} - True if point is inside the rectangle
   */
  isPointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
    return pointX >= rectX && pointX <= rectX + rectWidth &&
           pointY >= rectY && pointY <= rectY + rectHeight;
  }
  
  // =========================================
  // UTILITY METHODS
  // =========================================
  
  /**
   * Set debug mode
   * @param {boolean} enabled - Whether debug mode is enabled
   * @returns {ImprovedCanvasRenderer} - This renderer for chaining
   */
  setDebugMode(enabled) {
    this.options.debugMode = !!enabled;
    return this;
  }
  
  /**
   * Set culling mode
   * @param {boolean} enabled - Whether culling is enabled
   * @returns {ImprovedCanvasRenderer} - This renderer for chaining
   */
  setCulling(enabled) {
    this.options.culling = !!enabled;
    return this;
  }
  
  /**
   * Set error recovery mode
   * @param {boolean} enabled - Whether error recovery is enabled
   * @returns {ImprovedCanvasRenderer} - This renderer for chaining
   */
  setErrorRecovery(enabled) {
    this.options.errorRecovery = !!enabled;
    return this;
  }
  
  /**
   * Get all errors
   * @returns {Array} - Array of errors
   */
  getErrors() {
    return [...this._errors];
  }
  
  /**
   * Get the last error
   * @returns {Object|null} - Last error or null if no errors
   */
  getLastError() {
    return this._lastError;
  }
  
  /**
   * Clear all errors
   * @returns {ImprovedCanvasRenderer} - This renderer for chaining
   */
  clearErrors() {
    this._errors = [];
    this._lastError = null;
    return this;
  }
  
  /**
   * Get performance statistics
   * @returns {Object} - Performance statistics
   */
  getPerformanceStats() {
    return {
      lastFrameTime: this._performanceData.lastFrameTime,
      averageFrameTime: this._performanceData.averageFrameTime,
      maxFrameTime: this._performanceData.maxFrameTime,
      fps: this._performanceData.lastFrameTime > 0 ? 
        1000 / this._performanceData.lastFrameTime : 0,
      averageFps: this._performanceData.averageFrameTime > 0 ? 
        1000 / this._performanceData.averageFrameTime : 0,
      objectsDrawn: this._objectsDrawn,
      drawCalls: this._drawCalls,
      skippedDraws: this._skippedDraws
    };
  }
  
  /**
   * Get the current viewport information
   * @returns {Object} - Viewport information
   */
  getViewportInfo() {
    return {
      offset: { ...this.viewportOffset },
      scale: this.viewportScale,
      width: this.canvasWidth,
      height: this.canvasHeight,
      pixelRatio: this.pixelRatio
    };
  }
}

export default ImprovedCanvasRenderer;