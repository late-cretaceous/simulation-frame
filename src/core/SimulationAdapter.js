/**
 * Base adapter interface for connecting simulations to the framework
 * All simulations must extend this class to work with the framework UI
 */
export class SimulationAdapter {
  /**
   * Initialize the simulation
   * @param {CanvasRenderingContext2D} canvasContext - Canvas rendering context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  initialize(canvasContext, width, height) {
    throw new Error("Method 'initialize' must be implemented");
  }

  /**
   * Update the simulation state
   * @param {number} deltaTime - Time elapsed since last update in seconds
   */
  update(deltaTime) {
    throw new Error("Method 'update' must be implemented");
  }

  /**
   * Get entity positions for the minimap
   * @returns {Object} - Object with arrays of organism and food positions
   */
  getEntitiesForMinimap() {
    return { 
      organisms: [], 
      food: [] 
    };
  }

  /**
   * Select an entity at the given coordinates
   * @param {number} x - X coordinate (screen coordinates)
   * @param {number} y - Y coordinate (screen coordinates)
   * @param {Object} viewportInfo - Information about the viewport (offset, scale)
   * @returns {Object|null} - Selected entity data or null if none selected
   */
  selectEntityAt(x, y, viewportInfo) {
    return null;
  }

  /**
   * Get statistics about the current simulation state
   * @returns {Object} - Statistics object
   */
  getStatistics() {
    return {};
  }

  /**
   * Get configurable parameters for the simulation
   * @returns {Object} - Parameters object with key-value pairs
   */
  getParameters() {
    return {};
  }
  
  /**
   * Get metadata for configurable parameters
   * @returns {Object} - Parameter metadata object
   */
  getParameterMetadata() {
    return {};
  }

  /**
   * Set a parameter value
   * @param {string} key - Parameter key
   * @param {any} value - Parameter value
   */
  setParameter(key, value) {
    throw new Error("Method 'setParameter' must be implemented");
  }

  /**
   * Pause the simulation
   */
  pause() {
    throw new Error("Method 'pause' must be implemented");
  }

  /**
   * Resume the simulation
   */
  resume() {
    throw new Error("Method 'resume' must be implemented");
  }

  /**
   * Reset the simulation to its initial state
   */
  reset() {
    throw new Error("Method 'reset' must be implemented");
  }

  /**
   * Save the current simulation state
   * @returns {Object} - Serializable state object
   */
  saveState() {
    return {};
  }

  /**
   * Load a saved simulation state
   * @param {Object} state - Saved state object
   * @returns {boolean} - Success status
   */
  loadState(state) {
    return false;
  }

  /**
   * Save an entity to the library
   * @param {Object} entity - Entity data
   * @param {string} name - Entity name
   * @param {string} notes - Entity notes
   * @returns {Object|null} - Saved entity or null if failed
   */
  saveEntityToLibrary(entity, name, notes) {
    return null;
  }

  /**
   * Load entities from the library
   * @returns {Array} - Array of saved entities
   */
  loadEntitiesFromLibrary() {
    return [];
  }
}

export default SimulationAdapter;