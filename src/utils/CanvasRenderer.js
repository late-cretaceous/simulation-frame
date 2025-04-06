/**
 * CanvasRenderer.js - Helper class for canvas rendering in simulations
 * 
 * Handles common canvas operations like clearing, transformations, 
 * and high-DPI screen support
 */
export class CanvasRenderer {
    /**
     * Create a new canvas renderer
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {CanvasRenderingContext2D} context - The canvas context
     */
    constructor(canvas, context) {
      this.canvas = canvas;
      this.context = context;
      this.pixelRatio = window.devicePixelRatio || 1;
      this.viewportOffset = { x: 0, y: 0 };
      this.viewportScale = 1.0;
      
      // Initialize canvas
      this._setupCanvas();
    }
    
    /**
     * Set up canvas for proper rendering
     * @private
     */
    _setupCanvas() {
      // Store original canvas dimensions
      this.canvasWidth = this.canvas.width;
      this.canvasHeight = this.canvas.height;
      
      // Handle high-DPI screens
      if (this.pixelRatio > 1) {
        // Set canvas dimensions accounting for pixel ratio
        this.canvas.width = this.canvasWidth * this.pixelRatio;
        this.canvas.height = this.canvasHeight * this.pixelRatio;
        
        // Scale all drawing operations
        this.context.scale(this.pixelRatio, this.pixelRatio);
        
        // Set display size through CSS
        this.canvas.style.width = this.canvasWidth + 'px';
        this.canvas.style.height = this.canvasHeight + 'px';
      }
    }
    
    /**
     * Set the viewport transformation
     * @param {Object} offset - Viewport offset {x, y}
     * @param {number} scale - Viewport scale
     */
    setViewport(offset, scale) {
      this.viewportOffset = offset;
      this.viewportScale = scale;
    }
    
    /**
     * Clear the canvas completely
     */
    clear() {
      // Save current transformation
      this.context.save();
      
      // Reset transformation to identity
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      
      // Clear entire canvas
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Restore transformation
      this.context.restore();
    }
    
    /**
     * Begin a new frame (clear canvas and apply viewport)
     */
    beginFrame() {
      this.clear();
      
      // Apply viewport transformation
      this.context.save();
      this.context.translate(this.viewportOffset.x, this.viewportOffset.y);
      this.context.scale(this.viewportScale, this.viewportScale);
    }
    
    /**
     * End the current frame
     */
    endFrame() {
      this.context.restore();
    }
    
    /**
     * Draw a circle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Circle radius
     * @param {string} color - Fill color
     */
    drawCircle(x, y, radius, color) {
      this.context.beginPath();
      this.context.arc(x, y, radius, 0, Math.PI * 2);
      this.context.fillStyle = color;
      this.context.fill();
    }
    
    /**
     * Draw a rectangle
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string} color - Fill color
     */
    drawRect(x, y, width, height, color) {
      this.context.fillStyle = color;
      this.context.fillRect(x, y, width, height);
    }
    
    /**
     * Draw text
     * @param {string} text - Text to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Text color
     * @param {string} font - Font settings
     * @param {string} align - Text alignment
     */
    drawText(text, x, y, color = 'black', font = '12px sans-serif', align = 'left') {
      this.context.font = font;
      this.context.fillStyle = color;
      this.context.textAlign = align;
      this.context.fillText(text, x, y);
    }
    
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
  }
  
  export default CanvasRenderer;