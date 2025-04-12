/**
 * ImprovedBaseComponent
 * 
 * Enhanced base class for all components with:
 * - Improved error handling
 * - Automatic initialization
 * - Self-healing mechanisms
 * - Deep cloning and serialization support
 */

export class ImprovedBaseComponent {
  /**
   * Create a new component
   * @param {Object} initialData - Optional initial data
   */
  constructor(initialData = {}) {
    /**
     * Reference to the entity this component belongs to
     * @type {Object|null}
     */
    this.entity = null;
    
    /**
     * Whether the component is enabled
     * @type {boolean}
     */
    this.enabled = true;
    
    /**
     * Component initialization state
     * @type {boolean}
     * @private
     */
    this._initialized = false;
    
    /**
     * Component type (automatically set to constructor name)
     * @type {string}
     * @readonly
     */
    this.type = this.constructor.name;
    
    /**
     * Last error that occurred in this component
     * @type {Object|null}
     * @private
     */
    this._lastError = null;
    
    /**
     * Creation timestamp
     * @type {number}
     * @readonly
     */
    this.createdAt = Date.now();
    
    // Apply initial data if provided
    if (initialData && typeof initialData === 'object') {
      // Apply each property from initialData
      Object.keys(initialData).forEach(key => {
        // Skip special properties
        if (key !== 'entity' && key !== 'type' && !key.startsWith('_')) {
          this[key] = initialData[key];
        }
      });
    }
    
    // Auto-initialize
    this.initialize();
  }
  
  /**
   * Initialize the component
   * Can be overridden by subclasses to perform initialization
   * @returns {ImprovedBaseComponent} - This component for chaining
   */
  initialize() {
    // Do nothing in the base class implementation
    try {
      this._initialized = true;
    } catch (error) {
      this._lastError = {
        method: 'initialize',
        error: error,
        time: new Date()
      };
      console.error(`Error initializing component ${this.type}:`, error);
    }
    return this;
  }
  
  /**
   * Check if component is properly attached to an entity
   * @returns {boolean} - True if component is attached to an entity
   */
  isAttached() {
    return !!this.entity && typeof this.entity === 'object';
  }
  
  /**
   * Enable or disable the component
   * @param {boolean} value - Enable state
   * @returns {ImprovedBaseComponent} - This component for chaining
   */
  setEnabled(value) {
    this.enabled = !!value; // Ensure boolean value
    return this;
  }
  
  /**
   * Get the world this component belongs to (via its entity)
   * @returns {Object|null} - The world or null if not attached
   */
  getWorld() {
    try {
      if (!this.isAttached()) return null;
      
      // Try to access world through entity
      if (this.entity.world) {
        return this.entity.world;
      }
      
      // Alternative attempt through parent entity or entity's methods
      if (typeof this.entity.getWorld === 'function') {
        return this.entity.getWorld();
      }
      
      return null;
    } catch (error) {
      this._lastError = {
        method: 'getWorld',
        error: error,
        time: new Date()
      };
      console.error(`Error getting world for component ${this.type}:`, error);
      return null;
    }
  }
  
  /**
   * Clone this component to create a new instance with the same data
   * @returns {ImprovedBaseComponent} - A new component with the same data
   */
  clone() {
    try {
      // Create new instance of the same type
      const ComponentConstructor = this.constructor;
      const clone = new ComponentConstructor();
      
      // Deep copy all properties except special ones
      Object.keys(this).forEach(key => {
        if (key !== 'entity' && key !== 'createdAt' && !key.startsWith('_')) {
          const value = this[key];
          
          // Handle different types of properties for proper cloning
          if (value === null || value === undefined) {
            // Null or undefined values
            clone[key] = value;
          } else if (Array.isArray(value)) {
            // Array cloning with deep copy
            clone[key] = this._cloneArray(value);
          } else if (typeof value === 'object' && value.constructor === Object) {
            // Plain object cloning with deep copy
            clone[key] = this._cloneObject(value);
          } else if (value instanceof Date) {
            // Date objects
            clone[key] = new Date(value.getTime());
          } else {
            // Primitives and other values (functions, etc.)
            clone[key] = value;
          }
        }
      });
      
      // New creation timestamp
      clone.createdAt = Date.now();
      
      return clone;
    } catch (error) {
      this._lastError = {
        method: 'clone',
        error: error,
        time: new Date()
      };
      console.error(`Error cloning component ${this.type}:`, error);
      
      // Fallback: try to create a basic clone
      try {
        const ComponentConstructor = this.constructor;
        return new ComponentConstructor();
      } catch (fallbackError) {
        console.error('Failed to create fallback clone:', fallbackError);
        return null;
      }
    }
  }
  
  /**
   * Deep clone an array
   * @param {Array} array - Array to clone
   * @returns {Array} - Cloned array
   * @private
   */
  _cloneArray(array) {
    return array.map(item => {
      if (item === null || item === undefined) {
        return item;
      } else if (Array.isArray(item)) {
        return this._cloneArray(item);
      } else if (typeof item === 'object' && item.constructor === Object) {
        return this._cloneObject(item);
      } else if (item instanceof Date) {
        return new Date(item.getTime());
      } else {
        return item;
      }
    });
  }
  
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} - Cloned object
   * @private
   */
  _cloneObject(obj) {
    const clone = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      if (value === null || value === undefined) {
        clone[key] = value;
      } else if (Array.isArray(value)) {
        clone[key] = this._cloneArray(value);
      } else if (typeof value === 'object' && value.constructor === Object) {
        clone[key] = this._cloneObject(value);
      } else if (value instanceof Date) {
        clone[key] = new Date(value.getTime());
      } else {
        clone[key] = value;
      }
    });
    
    return clone;
  }
  
  /**
   * Perform cleanup when component is removed from entity
   * Can be overridden by subclasses to perform cleanup
   */
  cleanup() {
    try {
      this.entity = null;
      this._initialized = false;
    } catch (error) {
      this._lastError = {
        method: 'cleanup',
        error: error,
        time: new Date()
      };
      console.error(`Error during component cleanup ${this.type}:`, error);
    }
  }
  
  /**
   * Merge data into this component
   * @param {Object} data - Data to merge
   * @returns {ImprovedBaseComponent} - This component for chaining
   */
  merge(data) {
    if (!data || typeof data !== 'object') {
      return this;
    }
    
    try {
      // Merge properties
      Object.keys(data).forEach(key => {
        // Skip special properties
        if (key !== 'entity' && key !== 'type' && !key.startsWith('_')) {
          this[key] = data[key];
        }
      });
    } catch (error) {
      this._lastError = {
        method: 'merge',
        error: error,
        time: new Date()
      };
      console.error(`Error merging data into component ${this.type}:`, error);
    }
    
    return this;
  }
  
  /**
   * Get data representation of component for serialization
   * @returns {Object} - Plain object representing component data
   */
  toJSON() {
    try {
      const data = {
        type: this.type,
        enabled: this.enabled
      };
      
      // Add all properties except special ones
      Object.keys(this).forEach(key => {
        if (key !== 'entity' && key !== 'type' && !key.startsWith('_')) {
          const value = this[key];
          
          // Handle special cases for serialization
          if (value instanceof Date) {
            data[key] = value.toISOString();
          } else {
            data[key] = value;
          }
        }
      });
      
      return data;
    } catch (error) {
      this._lastError = {
        method: 'toJSON',
        error: error,
        time: new Date()
      };
      console.error(`Error serializing component ${this.type}:`, error);
      
      // Fallback: return basic data
      return {
        type: this.type,
        enabled: this.enabled
      };
    }
  }
  
  /**
   * Load data into component
   * @param {Object} data - Data to load
   * @returns {ImprovedBaseComponent} - This component for chaining
   */
  fromJSON(data) {
    if (!data || typeof data !== 'object') {
      return this;
    }
    
    try {
      // Set properties from data
      Object.keys(data).forEach(key => {
        // Skip special properties
        if (key !== 'type' && key !== 'entity' && !key.startsWith('_')) {
          this[key] = data[key];
        }
      });
    } catch (error) {
      this._lastError = {
        method: 'fromJSON',
        error: error,
        time: new Date()
      };
      console.error(`Error deserializing component ${this.type}:`, error);
    }
    
    return this;
  }
  
  /**
   * Reset component to initial state
   * @returns {ImprovedBaseComponent} - This component for chaining
   */
  reset() {
    try {
      // Preserve entity reference
      const entity = this.entity;
      
      // Reset to initial state by creating a new instance
      const ComponentConstructor = this.constructor;
      const initial = new ComponentConstructor();
      
      // Copy all properties from initial instance
      Object.keys(initial).forEach(key => {
        // Skip special properties
        if (key !== 'entity' && key !== 'createdAt' && !key.startsWith('_')) {
          this[key] = initial[key];
        }
      });
      
      // Restore entity reference
      this.entity = entity;
      
      // Re-initialize
      this.initialize();
    } catch (error) {
      this._lastError = {
        method: 'reset',
        error: error,
        time: new Date()
      };
      console.error(`Error resetting component ${this.type}:`, error);
    }
    
    return this;
  }
  
  /**
   * Get the last error that occurred in this component
   * @returns {Object|null} - Error information or null if no error
   */
  getLastError() {
    return this._lastError;
  }
  
  /**
   * Clear the last error
   * @returns {ImprovedBaseComponent} - This component for chaining
   */
  clearLastError() {
    this._lastError = null;
    return this;
  }
  
  /**
   * Check if component is in a valid state
   * @returns {boolean} - True if component is valid
   */
  isValid() {
    return this._initialized && this.enabled;
  }
  
  /**
   * Override toString for better debugging
   * @returns {string} - String representation
   */
  toString() {
    return `${this.type}(${this.entity ? `entity=${this.entity.id}` : 'detached'})`;
  }
}

export default ImprovedBaseComponent;