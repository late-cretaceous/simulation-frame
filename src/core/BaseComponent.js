/**
 * BaseComponent.js - Robust implementation with defensive programming practices
 * 
 * Base class for all components in the simulation framework
 * Components are pure data containers with no or minimal logic
 */
export class BaseComponent {
  /**
   * Create a new component
   */
  constructor() {
    /**
     * Reference to the entity this component belongs to
     * @type {Object|null}
     */
    this.entity = null;
    
    /**
     * Component is enabled (can be used to temporarily disable without removing)
     * @type {boolean}
     */
    this.enabled = true;
    
    /**
     * Component initialization state
     * @type {boolean}
     * @private
     */
    this._initialized = false;
  }
  
  /**
   * Initialize the component
   * Can be overridden by subclasses to perform initialization
   * @returns {BaseComponent} - This component for chaining
   */
  initialize() {
    this._initialized = true;
    return this;
  }
  
  /**
   * Check if component is properly attached to an entity
   * @returns {boolean} - True if component is attached to an entity
   */
  isAttached() {
    return this.entity !== null && typeof this.entity === 'object';
  }
  
  /**
   * Enable or disable the component
   * @param {boolean} value - Enable state
   * @returns {BaseComponent} - This component for chaining
   */
  setEnabled(value) {
    this.enabled = !!value;
    return this;
  }
  
  /**
   * Get the world this component belongs to (via its entity)
   * @returns {Object|null} - The world or null if not attached
   */
  getWorld() {
    if (!this.isAttached()) return null;
    
    // Access world through entity if available
    if (this.entity.world) {
      return this.entity.world;
    }
    
    return null;
  }
  
  /**
   * Clone this component to create a new instance with the same data
   * @returns {BaseComponent} - A new component with the same data
   */
  clone() {
    const clone = new this.constructor();
    
    // Copy all properties except entity reference and private properties
    Object.keys(this).forEach(key => {
      if (key !== 'entity' && !key.startsWith('_')) {
        // Handle deep cloning of objects if needed
        if (typeof this[key] === 'object' && this[key] !== null) {
          // Array cloning
          if (Array.isArray(this[key])) {
            clone[key] = [...this[key]];
          } 
          // Object cloning 
          else {
            clone[key] = {...this[key]};
          }
        } else {
          // Direct assignment for primitives
          clone[key] = this[key];
        }
      }
    });
    
    return clone;
  }
  
  /**
   * Perform cleanup when component is removed from entity
   * Can be overridden by subclasses to perform cleanup
   */
  cleanup() {
    this.entity = null;
    this._initialized = false;
  }
  
  /**
   * Get data representation of component (for serialization)
   * @returns {Object} - Plain object representing component data
   */
  toJSON() {
    const data = {
      type: this.constructor.name,
      enabled: this.enabled
    };
    
    // Add all properties except entity reference and private properties
    Object.keys(this).forEach(key => {
      if (key !== 'entity' && !key.startsWith('_')) {
        data[key] = this[key];
      }
    });
    
    return data;
  }
  
  /**
   * Load data into component
   * @param {Object} data - Data to load
   * @returns {BaseComponent} - This component for chaining
   */
  fromJSON(data) {
    if (data) {
      Object.keys(data).forEach(key => {
        if (key !== 'type' && key !== 'entity' && !key.startsWith('_')) {
          this[key] = data[key];
        }
      });
    }
    
    return this;
  }
}

export default BaseComponent;