/**
 * Base class for entities in the ECS system
 */
export class BaseEntity {
    /**
     * Create a new entity
     * @param {number} id - Unique identifier for this entity
     */
    constructor(id) {
      this.id = id;
      this.components = new Map();
    }
  
    /**
     * Add a component to this entity
     * @param {Object} component - The component to add
     * @returns {BaseEntity} - This entity for chaining
     */
    addComponent(component) {
      this.components.set(component.constructor.name, component);
      component.entity = this;
      return this;
    }
  
    /**
     * Remove a component from this entity
     * @param {Function|string} componentClass - The component class or name to remove
     * @returns {BaseEntity} - This entity for chaining
     */
    removeComponent(componentClass) {
      const componentName = typeof componentClass === 'string' 
        ? componentClass 
        : componentClass.name;
      this.components.delete(componentName);
      return this;
    }
  
    /**
     * Get a component from this entity
     * @param {Function|string} componentClass - The component class or name to get
     * @returns {Object|undefined} - The component or undefined if not found
     */
    getComponent(componentClass) {
      const componentName = typeof componentClass === 'string' 
        ? componentClass 
        : componentClass.name;
      return this.components.get(componentName);
    }
  
    /**
     * Check if this entity has a component
     * @param {Function|string} componentClass - The component class or name to check
     * @returns {boolean} - True if the entity has the component
     */
    hasComponent(componentClass) {
      const componentName = typeof componentClass === 'string' 
        ? componentClass 
        : componentClass.name;
      return this.components.has(componentName);
    }
  }
  
  export default BaseEntity;