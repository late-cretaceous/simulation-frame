/**
 * Base adapter interface for connecting simulations to the framework
 * All simulations must extend this class to work with the framework UI
 */
export class SimulationAdapter {
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
   * Initialize the simulation
   * @param {CanvasRenderingContext2D} _canvasContext - Canvas rendering context
   * @param {number} _width - Canvas width
   * @param {number} _height - Canvas height
   */
  initialize(_canvasContext, _width, _height) {
    throw new Error("Method 'initialize' must be implemented");
  }

  /**
   * Update the simulation state
   * @param {number} _deltaTime - Time elapsed since last update in seconds
   */
  update(_deltaTime) {
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
   * @param {number} _x - X coordinate (screen coordinates)
   * @param {number} _y - Y coordinate (screen coordinates)
   * @param {Object} _viewportInfo - Information about the viewport (offset, scale)
   * @returns {Object|null} - Selected entity data or null if none selected
   */
  selectEntityAt(_x, _y, _viewportInfo) {
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
   * Set a parameter value
   * @param {string} _key - Parameter key
   * @param {any} _value - Parameter value
   */
  setParameter(_key, _value) {
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
   * @param {Object} _state - Saved state object
   * @returns {boolean} - Success status
   */
  loadState(_state) {
    return false;
  }

  /**
   * Save an entity to the library
   * @param {Object} _entity - Entity data
   * @param {string} _name - Entity name
   * @param {string} _notes - Entity notes
   * @returns {Object|null} - Saved entity or null if failed
   */
  saveEntityToLibrary(_entity, _name, _notes) {
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