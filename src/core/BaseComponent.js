/**
 * Base class for all components
 * Components are pure data containers
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
    }
  
    /**
     * Clone this component
     * @returns {BaseComponent} - A new component with the same data
     */
    clone() {
      const clone = new this.constructor();
      
      // Copy all properties except entity reference
      Object.keys(this).forEach(key => {
        if (key !== 'entity') {
          clone[key] = this[key];
        }
      });
      
      return clone;
    }
  }
  
  export default BaseComponent;