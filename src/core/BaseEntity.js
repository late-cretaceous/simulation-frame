/**
 * Enhanced base class for entities in the ECS system with:
 * - Safe component access
 * - Automatic dependency resolution
 * - Error tracking
 */
export class EnhancedBaseEntity {
    /**
     * Create a new entity
     * @param {number} id - Unique identifier for this entity
     */
    constructor(id) {
      this.id = id;
      this.components = new Map();
      this.world = null;
      this._lastError = null;
      this._errorCounts = {};
      this._maxErrorsBeforeBreaker = 5;
    }
  
    /**
     * Add a component to this entity
     * @param {Object} component - The component to add
     * @returns {EnhancedBaseEntity} - This entity for chaining
     */
    addComponent(component) {
      if (!component) return this;
      
      try {
        this.components.set(component.constructor.name, component);
        component.entity = this;
      } catch (error) {
        this._trackError('addComponent', error);
      }
      
      return this;
    }
  
    /**
     * Remove a component from this entity
     * @param {Function|string} componentClass - The component class or name to remove
     * @returns {EnhancedBaseEntity} - This entity for chaining
     */
    removeComponent(componentClass) {
      try {
        const componentName = typeof componentClass === 'string' 
          ? componentClass 
          : componentClass.name;
        
        const component = this.components.get(componentName);
        if (component) {
          // Clear entity reference
          component.entity = null;
          
          // Call cleanup if available
          if (typeof component.cleanup === 'function') {
            try {
              component.cleanup();
            } catch (error) {
              this._trackError('removeComponent_cleanup', error);
            }
          }
          
          // Remove from components map
          this.components.delete(componentName);
        }
      } catch (error) {
        this._trackError('removeComponent', error);
      }
      
      return this;
    }
  
    /**
     * Get a component from this entity with automatic resolution for missing components
     * @param {Function|string} componentClass - The component class or name to get
     * @returns {Object|null} - The component or null if not found and cannot be created
     */
    getComponent(componentClass) {
      try {
        const componentName = typeof componentClass === 'string' 
          ? componentClass 
          : componentClass.name;
        
        // Try to get existing component
        const component = this.components.get(componentName);
        if (component) return component;
        
        // If world is available, try to request component creation
        if (this.world && typeof this.world.canCreateComponent === 'function' &&
            this.world.canCreateComponent(componentName)) {
          const newComponent = this.world.createDefaultComponent(componentName, this);
          if (newComponent) {
            this.addComponent(newComponent);
            return newComponent;
          }
        }
        
        return null;
      } catch (error) {
        this._trackError('getComponent', error);
        return null;
      }
    }
    
    /**
     * Get a component safely, never returning undefined
     * @param {Function|string} componentClass - The component class or name to get
     * @returns {Object|null} - The component or null if not found
     */
    getComponentSafe(componentClass) {
      const component = this.getComponent(componentClass);
      return component || this._getNullComponent(componentClass);
    }
    
    /**
     * Get a null object implementation for the requested component type
     * @param {Function|string} componentClass - The component class or name
     * @returns {Object} - A null object that won't cause errors
     * @private
     */
    _getNullComponent(componentClass) {
      const componentName = typeof componentClass === 'string' 
        ? componentClass 
        : componentClass.name;
      
      // If world provides null components, use that
      if (this.world && typeof this.world.getNullComponent === 'function') {
        return this.world.getNullComponent(componentName);
      }
      
      // Otherwise, create a simple null object
      return {
        type: componentName,
        enabled: false,
        entity: null,
        isNull: true,
        
        // Basic methods that won't throw errors
        isValid: () => false,
        initialize: () => { return this; },
        cleanup: () => { return this; }
      };
    }
  
    /**
     * Check if this entity has a component
     * @param {Function|string} componentClass - The component class or name to check
     * @returns {boolean} - True if the entity has the component
     */
    hasComponent(componentClass) {
      try {
        const componentName = typeof componentClass === 'string' 
          ? componentClass 
          : componentClass.name;
        
        return this.components.has(componentName);
      } catch (error) {
        this._trackError('hasComponent', error);
        return false;
      }
    }
    
    /**
     * Get world this entity belongs to
     * @returns {Object|null} - The world or null if not attached
     */
    getWorld() {
      return this.world;
    }
    
    /**
     * Set the world reference
     * @param {Object} world - The world this entity belongs to
     * @returns {EnhancedBaseEntity} - This entity for chaining
     */
    setWorld(world) {
      this.world = world;
      return this;
    }
    
    /**
     * Track an error
     * @param {string} method - Method where error occurred
     * @param {Error} error - The error object
     * @private
     */
    _trackError(method, error) {
      // Record error count for circuit breaker
      this._errorCounts[method] = (this._errorCounts[method] || 0) + 1;
      
      // Store last error
      this._lastError = {
        method,
        error,
        time: new Date()
      };
      
      // Log error
      console.error(`Entity ${this.id} error in ${method}:`, error);
    }
    
    /**
     * Get the last error
     * @returns {Object|null} - Last error or null if no errors
     */
    getLastError() {
      return this._lastError;
    }
  }
  
  // For backward compatibility
  export class BaseEntity extends EnhancedBaseEntity {}
  
  export default BaseEntity;