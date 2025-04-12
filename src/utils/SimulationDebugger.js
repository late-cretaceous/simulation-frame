/**
 * SimulationDebugger.js
 * 
 * A comprehensive debugging utility for simulations that provides:
 * - Visual debugging overlays
 * - Performance monitoring
 * - Error tracking and recovery
 * - State inspection and validation
 */

export class SimulationDebugger {
  /**
   * Create a new simulation debugger
   * @param {Object} simulation - The simulation instance to debug
   * @param {Object} options - Configuration options
   */
  constructor(simulation, options = {}) {
    // Store simulation reference
    this.simulation = simulation;
    
    // Default options
    this.options = {
      enabled: true,                // Whether debugging is enabled
      visualDebugging: true,        // Whether to show visual overlays
      performanceMonitoring: true,  // Whether to monitor performance
      errorTracking: true,          // Whether to track errors
      logLevel: 'warning',          // Log level: 'debug', 'info', 'warning', 'error'
      maxErrorsTracked: 50,         // Maximum number of errors to track
      ...options
    };
    
    // Initialize state
    this.active = false;
    this.errors = [];
    this.warnings = [];
    this.metrics = {
      fps: 0,
      frameTime: 0,
      entityCount: 0,
      systemUpdateTimes: {},
      lastUpdateTime: 0
    };
    
    // Performance monitoring
    this.performanceData = {
      frames: [],
      maxFrames: 100,
      startTime: 0,
      totalFrames: 0
    };
    
    // Hook references
    this.hooks = {
      update: null,
      render: null
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the debugger
   */
  initialize() {
    if (!this.simulation) {
      console.error('SimulationDebugger: No simulation provided');
      return;
    }
    
    // Store original methods for later restoration
    if (this.simulation.update) {
      this.originalMethods = {
        update: this.simulation.update.bind(this.simulation)
      };
    }
    
    // Install hooks if debugging is enabled
    if (this.options.enabled) {
      this.install();
    }
  }
  
  /**
   * Install debugging hooks
   */
  install() {
    if (!this.simulation || this.active) return;
    
    try {
      // Hook update method
      if (this.simulation.update && typeof this.simulation.update === 'function') {
        const originalUpdate = this.simulation.update.bind(this.simulation);
        
        this.simulation.update = (deltaTime) => {
          return this.updateHook(deltaTime, originalUpdate);
        };
      }
      
      // Initialize performance monitoring
      if (this.options.performanceMonitoring) {
        this.performanceData.startTime = performance.now();
      }
      
      this.active = true;
      this.log('debug', 'Debugger installed successfully');
    } catch (error) {
      console.error('Failed to install debugger:', error);
    }
  }
  
  /**
   * Uninstall debugging hooks
   */
  uninstall() {
    if (!this.simulation || !this.active) return;
    
    try {
      // Restore original methods
      if (this.originalMethods && this.originalMethods.update) {
        this.simulation.update = this.originalMethods.update;
      }
      
      this.active = false;
      this.log('debug', 'Debugger uninstalled successfully');
    } catch (error) {
      console.error('Failed to uninstall debugger:', error);
    }
  }
  
  /**
   * Hook for the update method
   * @param {number} deltaTime - Time elapsed since last update
   * @param {Function} originalUpdate - Original update method
   * @returns {boolean} - Success status
   */
  updateHook(deltaTime, originalUpdate) {
    if (!this.active) {
      return originalUpdate(deltaTime);
    }
    
    try {
      // Start performance measurement
      const startTime = performance.now();
      
      // Validate entity state before update
      if (this.options.visualDebugging) {
        this.validateEntityState();
      }
      
      // Call original update
      const result = originalUpdate(deltaTime);
      
      // End performance measurement
      const endTime = performance.now();
      const frameTime = endTime - startTime;
      
      // Update performance metrics
      this.updatePerformanceMetrics(frameTime, deltaTime);
      
      // Draw debug information if enabled
      if (this.options.visualDebugging && this.simulation.context) {
        this.drawDebugOverlay(this.simulation.context);
      }
      
      return result;
    } catch (error) {
      this.trackError('update', error);
      
      // Try to recover and call original
      try {
        return originalUpdate(deltaTime);
      } catch (recoveryError) {
        this.trackError('update-recovery', recoveryError);
        return false;
      }
    }
  }
  
  /**
   * Update performance metrics
   * @param {number} frameTime - Time taken to process the frame
   * @param {number} deltaTime - Time elapsed since last update
   */
  updatePerformanceMetrics(frameTime, deltaTime) {
    if (!this.options.performanceMonitoring) return;
    
    // Calculate FPS
    const fps = deltaTime > 0 ? 1 / deltaTime : 0;
    
    // Update metrics
    this.metrics.fps = this.metrics.fps * 0.9 + fps * 0.1; // Smooth FPS
    this.metrics.frameTime = frameTime;
    this.metrics.lastUpdateTime = performance.now();
    
    // Count entities if world is available
    if (this.simulation.world) {
      this.metrics.entityCount = this.simulation.world.entities ? 
        this.simulation.world.entities.size : 0;
    }
    
    // Record frame data
    this.performanceData.frames.push({
      time: performance.now() - this.performanceData.startTime,
      fps,
      frameTime,
      entityCount: this.metrics.entityCount
    });
    
    // Limit stored frames
    if (this.performanceData.frames.length > this.performanceData.maxFrames) {
      this.performanceData.frames.shift();
    }
    
    // Increment total frames
    this.performanceData.totalFrames++;
  }
  
  /**
   * Validate entity state
   */
  validateEntityState() {
    if (!this.simulation.world || !this.simulation.world.entities) {
      return;
    }
    
    try {
      // Check for entities with missing components
      for (const [id, entity] of this.simulation.world.entities) {
        // Check if position component exists for entities
        if (!entity.hasComponent('PositionComponent')) {
          this.trackWarning('entity-validation', 
            `Entity ${id} is missing required PositionComponent`);
        }
      }
    } catch (error) {
      this.trackError('entity-validation', error);
    }
  }
  
  /**
   * Draw debug overlay on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawDebugOverlay(ctx) {
    if (!ctx || !this.options.visualDebugging) return;
    
    try {
      // Save context state
      ctx.save();
      
      // Reset transformation for overlay drawing
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Draw performance metrics
      this.drawPerformanceMetrics(ctx);
      
      // Draw entity debug information
      this.drawEntityDebugInfo(ctx);
      
      // Draw errors and warnings
      this.drawErrorsAndWarnings(ctx);
      
      // Restore context state
      ctx.restore();
    } catch (error) {
      console.error('Error drawing debug overlay:', error);
    }
  }
  
  /**
   * Draw performance metrics
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawPerformanceMetrics(ctx) {
    // Set text properties
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'right';
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(ctx.canvas.width - 220, 10, 210, 90);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Draw metrics
    const x = ctx.canvas.width - 15;
    let y = 30;
    
    ctx.fillText(`FPS: ${this.metrics.fps.toFixed(1)}`, x, y);
    y += 20;
    ctx.fillText(`Frame Time: ${this.metrics.frameTime.toFixed(2)}ms`, x, y);
    y += 20;
    ctx.fillText(`Entities: ${this.metrics.entityCount}`, x, y);
    y += 20;
    
    // Draw FPS category indication
    let fpsColor;
    if (this.metrics.fps >= 55) {
      fpsColor = 'rgb(0, 255, 0)'; // Green for good FPS
    } else if (this.metrics.fps >= 30) {
      fpsColor = 'rgb(255, 255, 0)'; // Yellow for OK FPS
    } else {
      fpsColor = 'rgb(255, 0, 0)'; // Red for poor FPS
    }
    
    // FPS status indicator
    ctx.fillStyle = fpsColor;
    ctx.beginPath();
    ctx.arc(ctx.canvas.width - 200, 30, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw entity debug information
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawEntityDebugInfo(ctx) {
    if (!this.simulation.world || !this.simulation.world.entities) {
      return;
    }
    
    // Save current viewport transformation 
    const viewportInfo = this.getViewportInfo();
    
    // Draw entity debug visuals
    for (const [id, entity] of this.simulation.world.entities) {
      if (entity.hasComponent('PositionComponent')) {
        const position = entity.getComponent('PositionComponent');
        
        // Convert world to screen coordinates
        const screenPos = this.worldToScreen(position.x, position.y, viewportInfo);
        
        // Skip if out of visible area
        if (screenPos.x < -100 || screenPos.x > ctx.canvas.width + 100 || 
            screenPos.y < -100 || screenPos.y > ctx.canvas.height + 100) {
          continue;
        }
        
        // Draw entity ID
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(`#${id}`, screenPos.x, screenPos.y - 15);
        
        // Draw velocity vector if present
        if (entity.hasComponent('VelocityComponent')) {
          const velocity = entity.getComponent('VelocityComponent');
          const speed = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
          
          // Draw velocity vector
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y);
          
          // Scale vector by velocity magnitude
          const vectorLength = Math.min(30, speed / 2);
          const normalizedVx = velocity.vx / speed;
          const normalizedVy = velocity.vy / speed;
          
          ctx.lineTo(
            screenPos.x + normalizedVx * vectorLength,
            screenPos.y + normalizedVy * vectorLength
          );
          
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }
  
  /**
   * Draw errors and warnings
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawErrorsAndWarnings(ctx) {
    // Draw only if we have errors or warnings
    if (this.errors.length === 0 && this.warnings.length === 0) {
      return;
    }
    
    // Set text properties
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, ctx.canvas.height - 110, 300, 100);
    
    // Draw header
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fillText('SIMULATION ISSUES:', 15, ctx.canvas.height - 95);
    
    // Draw errors
    let y = ctx.canvas.height - 80;
    for (let i = Math.max(0, this.errors.length - 3); i < this.errors.length; i++) {
      const error = this.errors[i];
      ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
      ctx.fillText(`[ERROR] ${error.source}: ${error.message.substring(0, 40)}`, 15, y);
      y += 15;
    }
    
    // Draw warnings
    for (let i = Math.max(0, this.warnings.length - 3); i < this.warnings.length; i++) {
      const warning = this.warnings[i];
      ctx.fillStyle = 'rgba(255, 255, 100, 0.8)';
      ctx.fillText(`[WARN] ${warning.source}: ${warning.message.substring(0, 40)}`, 15, y);
      y += 15;
    }
  }
  
  /**
   * Get viewport information for coordinate conversion
   * @returns {Object} - Viewport information
   */
  getViewportInfo() {
    const defaultViewport = {
      offset: { x: 0, y: 0 },
      scale: 1
    };
    
    // Check if context has viewport information
    if (this.simulation.context) {
      if (this.simulation.context.viewportOffset && this.simulation.context.viewportScale) {
        return {
          offset: this.simulation.context.viewportOffset,
          scale: this.simulation.context.viewportScale
        };
      }
    }
    
    // Try to get viewport info from simulation
    if (this.simulation.viewportOffset && this.simulation.viewportScale) {
      return {
        offset: this.simulation.viewportOffset,
        scale: this.simulation.viewportScale
      };
    }
    
    return defaultViewport;
  }
  
  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - X coordinate in world space
   * @param {number} worldY - Y coordinate in world space
   * @param {Object} viewport - Viewport information
   * @returns {Object} - Screen coordinates
   */
  worldToScreen(worldX, worldY, viewport) {
    return {
      x: worldX * viewport.scale + viewport.offset.x,
      y: worldY * viewport.scale + viewport.offset.y
    };
  }
  
  /**
   * Track an error
   * @param {string} source - Error source
   * @param {Error|string} error - Error object or message
   */
  trackError(source, error) {
    if (!this.options.errorTracking) return;
    
    // Format error
    const errorInfo = {
      source,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      time: new Date()
    };
    
    // Add to errors list
    this.errors.push(errorInfo);
    
    // Limit errors list
    if (this.errors.length > this.options.maxErrorsTracked) {
      this.errors.shift();
    }
    
    // Log error based on log level
    if (this.shouldLog('error')) {
      console.error(`[SimDebugger] ${source}:`, error);
    }
  }
  
  /**
   * Track a warning
   * @param {string} source - Warning source
   * @param {string} message - Warning message
   */
  trackWarning(source, message) {
    // Format warning
    const warningInfo = {
      source,
      message,
      time: new Date()
    };
    
    // Add to warnings list
    this.warnings.push(warningInfo);
    
    // Limit warnings list
    if (this.warnings.length > this.options.maxErrorsTracked) {
      this.warnings.shift();
    }
    
    // Log warning based on log level
    if (this.shouldLog('warning')) {
      console.warn(`[SimDebugger] ${source}: ${message}`);
    }
  }
  
  /**
   * Check if a message should be logged based on log level
   * @param {string} level - Message level
   * @returns {boolean} - True if should log
   */
  shouldLog(level) {
    const levels = {
      debug: 0,
      info: 1,
      warning: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.options.logLevel];
  }
  
  /**
   * Log a message
   * @param {string} level - Log level
   * @param {string} message - Message to log
   */
  log(level, message) {
    if (!this.shouldLog(level)) return;
    
    switch (level) {
      case 'debug':
        console.debug(`[SimDebugger] ${message}`);
        break;
      case 'info':
        console.info(`[SimDebugger] ${message}`);
        break;
      case 'warning':
        console.warn(`[SimDebugger] ${message}`);
        break;
      case 'error':
        console.error(`[SimDebugger] ${message}`);
        break;
    }
  }
  
  /**
   * Generate a performance report
   * @returns {Object} - Performance report
   */
  generatePerformanceReport() {
    if (!this.options.performanceMonitoring) {
      return { enabled: false };
    }
    
    // Calculate statistics
    const frames = this.performanceData.frames;
    
    if (frames.length === 0) {
      return {
        enabled: true,
        frames: 0,
        averageFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        averageFrameTime: 0
      };
    }
    
    // Calculate statistics
    let totalFPS = 0;
    let totalFrameTime = 0;
    let minFPS = Infinity;
    let maxFPS = 0;
    
    for (const frame of frames) {
      totalFPS += frame.fps;
      totalFrameTime += frame.frameTime;
      
      if (frame.fps < minFPS) minFPS = frame.fps;
      if (frame.fps > maxFPS) maxFPS = frame.fps;
    }
    
    return {
      enabled: true,
      frames: this.performanceData.totalFrames,
      averageFPS: totalFPS / frames.length,
      minFPS,
      maxFPS,
      averageFrameTime: totalFrameTime / frames.length,
      entityCount: this.metrics.entityCount,
      runTime: (performance.now() - this.performanceData.startTime) / 1000
    };
  }
  
  /**
   * Get all tracked errors
   * @returns {Array} - Array of errors
   */
  getErrors() {
    return [...this.errors];
  }
  
  /**
   * Get all tracked warnings
   * @returns {Array} - Array of warnings
   */
  getWarnings() {
    return [...this.warnings];
  }
  
  /**
   * Clear all tracked errors and warnings
   */
  clearErrorsAndWarnings() {
    this.errors = [];
    this.warnings = [];
  }
  
  /**
   * Toggle debugger on/off
   * @param {boolean} enabled - Whether debugging is enabled
   */
  toggle(enabled) {
    if (enabled === undefined) {
      enabled = !this.options.enabled;
    }
    
    this.options.enabled = enabled;
    
    if (enabled && !this.active) {
      this.install();
    } else if (!enabled && this.active) {
      this.uninstall();
    }
  }
  
  /**
   * Check the health of the simulation
   * @returns {Object} - Health status
   */
  checkHealth() {
    const status = {
      healthy: true,
      issues: [],
      entityCount: 0,
      systemCount: 0,
      errorCount: this.errors.length,
      warningCount: this.warnings.length
    };
    
    // Check world
    if (!this.simulation.world) {
      status.healthy = false;
      status.issues.push('World is not initialized');
    } else {
      // Check entities
      status.entityCount = this.simulation.world.entities ? 
        this.simulation.world.entities.size : 0;
      
      // Check systems
      status.systemCount = this.simulation.world.systems ? 
        this.simulation.world.systems.length : 0;
      
      if (status.systemCount === 0) {
        status.issues.push('No systems registered');
      }
    }
    
    // Check context
    if (!this.simulation.context) {
      status.issues.push('Rendering context is not initialized');
    }
    
    // Performance issues
    if (this.metrics.fps < 30 && this.metrics.fps > 0) {
      status.issues.push(`Low FPS: ${this.metrics.fps.toFixed(1)}`);
    }
    
    // Recent errors
    if (this.errors.length > 0) {
      const recentErrors = this.errors.slice(-3);
      status.issues.push(...recentErrors.map(e => `Error in ${e.source}: ${e.message}`));
    }
    
    // Set health status based on issues
    if (status.issues.length > 0) {
      status.healthy = false;
    }
    
    return status;
  }
  
  /**
   * Destroy the debugger and clean up
   */
  destroy() {
    this.uninstall();
    this.simulation = null;
    this.active = false;
    this.errors = [];
    this.warnings = [];
  }
}

export default SimulationDebugger;
