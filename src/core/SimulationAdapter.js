/**
 * SimulationAdapter.js - Robust implementation with defensive programming practices
 * 
 * Base adapter interface for connecting simulations to the framework
 * All simulations must extend this class to work with the framework UI
 */
import BaseWorld from './BaseWorld';

export class SimulationAdapter {
  /**
   * Create a new simulation adapter
   */
  constructor() {
    // Core properties with defaults
    this.world = null;
    this.context = null;
    this.width = 800;
    this.height = 600;
    this.isPaused = false;
    this.isInitialized = false;
    
    // Store parameters in a separate object for easy serialization
    this.parameters = {};
    
    // Track systems specifically created by this adapter
    this._ownedSystems = new Set();
    
    // Error tracking
    this._lastError = null;
  }
  
  /**
   * Get the primary metric key used by this simulation
   * Override this in custom simulations to change the primary display metric
   * @returns {string} - The key of the primary metric (default: 'generation')
   */
  getPrimaryMetric() {
    return 'generation';
  }

  /**
   * Get the label for the primary metric
   * Override this in custom simulations to customize the primary metric label
   * @returns {string} - The display label for the primary metric
   */
  getPrimaryMetricLabel() {
    const metric = this.getPrimaryMetric();
    // Convert camelCase to Title Case (e.g., 'timeElapsed' to 'Time Elapsed')
    return metric
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  /**
   * Get a formatter function for the primary metric
   * Override this in custom simulations to customize the primary metric formatting
   * @returns {Function|null} - A function that takes the metric value and returns formatted string
   */
  getPrimaryMetricFormatter() {
    return null; // Default to standard formatting in SimulationStats
  }

/**
 * Initialize the simulation with proper sequence and error handling
 * @param {CanvasRenderingContext2D} canvasContext - Canvas rendering context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {boolean} - Success status
 */
initialize(canvasContext, width, height) {
  // Prevent re-initialization
  if (this.isInitialized) {
    console.warn('SimulationAdapter: Already initialized');
    return true;
  }
  
  try {
    // 1. Store basic parameters first
    this.context = canvasContext;
    this.width = width;
    this.height = height;
    
    // 2. Create world if not exists - but don't initialize yet
    if (!this.world) {
      this.world = new BaseWorld();
    }
    
    // 3. Do any simulation-specific setup that doesn't require the world
    // If subclasses override this method, they should call super.initialize()
    // and then do their custom setup
    
    // 4. Now initialize the world
    this.world.initialize();
    
    // 5. Mark adapter as initialized
    this.isInitialized = true;
    
    // 6. Only after initialization is complete, set up systems
    this._setupSystems();
    
    return true;
  } catch (error) {
    this._handleError('initialize', error);
    this.isInitialized = false; // Ensure we're marked as uninitialized on failure
    return false;
  }
}

/**
 * Set up systems - extracted to separate method to avoid circular dependencies
 * @private
 */
_setupSystems() {
  // Override in subclasses to add systems
  // This runs after the world is fully initialized
}

  /**
   * Check if simulation is initialized
   * @returns {boolean} - True if initialized
   * @private
   */
  _checkInitialized() {
    if (!this.isInitialized) {
      console.warn('SimulationAdapter: Method called before simulation was initialized');
      return false;
    }
    return true;
  }
  
  /**
   * Handle errors in adapter methods
   * @param {string} methodName - Method where error occurred
   * @param {Error} error - The error object
   * @private
   */
  _handleError(methodName, error) {
    this._lastError = {
      method: methodName,
      error: error,
      time: new Date()
    };
    
    console.error(`SimulationAdapter error in ${methodName}:`, error);
  }

  /**
   * Update the simulation state
   * @param {number} deltaTime - Time elapsed since last update in seconds
   * @returns {boolean} - Success status
   */
  update(deltaTime) {
    if (this.isPaused || !this._checkInitialized()) return false;
    
    try {
      // Validate world exists
      if (!this.world) {
        throw new Error('World not initialized');
      }
      
      // Update world
      this.world.update(deltaTime);
      return true;
    } catch (error) {
      this._handleError('update', error);
      return false;
    }
  }

  /**
   * Get entity positions for the minimap
   * @returns {Object} - Object with arrays of organism and food positions
   */
  getEntitiesForMinimap() {
    if (!this._checkInitialized()) {
      return { organisms: [], food: [] };
    }
    
    try {
      // Default implementation returns empty arrays
      // Override in subclasses to provide actual data
      return { 
        organisms: [], 
        food: [] 
      };
    } catch (error) {
      this._handleError('getEntitiesForMinimap', error);
      return { organisms: [], food: [] };
    }
  }

  /**
   * Select an entity at the given coordinates
   * @param {number} x - X coordinate (screen coordinates)
   * @param {number} y - Y coordinate (screen coordinates)
   * @param {Object} viewportInfo - Information about the viewport (offset, scale)
   * @returns {Object|null} - Selected entity data or null if none selected
   */
  selectEntityAt(x, y, viewportInfo) {
    if (!this._checkInitialized()) return null;
    
    try {
      // Default implementation returns null
      // Override in subclasses to provide actual selection logic
      return null;
    } catch (error) {
      this._handleError('selectEntityAt', error);
      return null;
    }
  }

  /**
   * Get statistics about the current simulation state
   * @returns {Object} - Statistics object
   */
  getStatistics() {
    if (!this._checkInitialized()) return {};
    
    try {
      // Default implementation returns empty object
      // Override in subclasses to provide actual statistics
      return {};
    } catch (error) {
      this._handleError('getStatistics', error);
      return {};
    }
  }

  /**
   * Get configurable parameters for the simulation
   * @returns {Object} - Parameters object with key-value pairs
   */
  getParameters() {
    return {...this.parameters};
  }
  
  /**
   * Get metadata about parameters for UI controls
   * @returns {Object} - Parameter metadata
   */
  getParameterMetadata() {
    // Default implementation - override in subclasses
    return {};
  }

  /**
   * Set a parameter value
   * @param {string} key - Parameter key
   * @param {any} value - Parameter value
   * @returns {boolean} - Success status
   */
  setParameter(key, value) {
    if (!key || typeof key !== 'string') {
      console.warn('SimulationAdapter: Invalid parameter key');
      return false;
    }
    
    try {
      // Store parameter value
      this.parameters[key] = value;
      return true;
    } catch (error) {
      this._handleError('setParameter', error);
      return false;
    }
  }

  /**
   * Pause the simulation
   * @returns {boolean} - Success status
   */
  pause() {
    if (!this._checkInitialized()) return false;
    
    try {
      this.isPaused = true;
      return true;
    } catch (error) {
      this._handleError('pause', error);
      return false;
    }
  }

  /**
   * Resume the simulation
   * @returns {boolean} - Success status
   */
  resume() {
    if (!this._checkInitialized()) return false;
    
    try {
      this.isPaused = false;
      return true;
    } catch (error) {
      this._handleError('resume', error);
      return false;
    }
  }

  /**
   * Reset the simulation to its initial state
   * @returns {boolean} - Success status
   */
  reset() {
    if (!this._checkInitialized()) return false;
    
    try {
      // Clear world if exists
      if (this.world) {
        this.world.clear();
      }
      
      return true;
    } catch (error) {
      this._handleError('reset', error);
      return false;
    }
  }

  /**
   * Save the current simulation state
   * @returns {Object} - Serializable state object
   */
  saveState() {
    if (!this._checkInitialized()) return {};
    
    try {
      // Basic state
      return {
        parameters: {...this.parameters},
        timestamp: Date.now()
      };
    } catch (error) {
      this._handleError('saveState', error);
      return {};
    }
  }

  /**
   * Load a saved simulation state
   * @param {Object} state - Saved state object
   * @returns {boolean} - Success status
   */
  loadState(state) {
    if (!state || typeof state !== 'object') {
      console.warn('SimulationAdapter: Invalid state object');
      return false;
    }
    
    try {
      // Load parameters if exists
      if (state.parameters) {
        this.parameters = {...this.parameters, ...state.parameters};
      }
      
      return true;
    } catch (error) {
      this._handleError('loadState', error);
      return false;
    }
  }

  /**
   * Save an entity to the library
   * @param {Object} entity - Entity data
   * @param {string} name - Entity name
   * @param {string} notes - Entity notes
   * @returns {Object|null} - Saved entity or null if failed
   */
  saveEntityToLibrary(entity, name, notes) {
    if (!this._checkInitialized()) return null;
    
    try {
      // Default implementation returns null
      // Override in subclasses to provide actual save logic
      return null;
    } catch (error) {
      this._handleError('saveEntityToLibrary', error);
      return null;
    }
  }

  /**
   * Load entities from the library
   * @returns {Array} - Array of saved entities
   */
  loadEntitiesFromLibrary() {
    if (!this._checkInitialized()) return [];
    
    try {
      // Default implementation returns empty array
      // Override in subclasses to provide actual load logic
      return [];
    } catch (error) {
      this._handleError('loadEntitiesFromLibrary', error);
      return [];
    }
  }
  
  /**
   * Get the last error that occurred in the simulation
   * @returns {Object|null} - Error object or null if no error
   */
  getLastError() {
    return this._lastError;
  }
  
  /**
   * Dispose of the simulation and clean up resources
   */
  dispose() {
    try {
      // Clean up systems
      for (const system of this._ownedSystems) {
        if (typeof system.cleanup === 'function') {
          system.cleanup();
        }
      }
      
      // Clean up world
      if (this.world && typeof this.world.dispose === 'function') {
        this.world.dispose();
      }
      
      // Reset properties
      this.world = null;
      this.context = null;
      this.isInitialized = false;
      this._ownedSystems.clear();
    } catch (error) {
      this._handleError('dispose', error);
    }
  }
}

export default SimulationAdapter;