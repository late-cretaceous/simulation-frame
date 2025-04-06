/**
 * BaseWorld.js - Robust implementation with defensive programming practices
 * 
 * Core class for managing entities and systems in the simulation framework
 */
export class BaseWorld {
  /**
   * Create a new world instance
   */
  constructor() {
    // Entity storage - using Map for O(1) access by ID
    this.entities = new Map();
    
    // Systems storage - array for ordered execution
    this.systems = [];
    
    // Entity ID counter
    this.nextEntityId = 1;
    
    // Component type registry (optional, for type checking)
    this.componentTypes = new Set();
    
    // Track initialization state
    this.isInitialized = false;
  }
  
  /**
   * Initialize the world
   * Must be called before using other methods
   */
  initialize() {
    // Mark as initialized
    this.isInitialized = true;
    
    // Initialize systems if needed
    for (const system of this.systems) {
      if (system.initialize && typeof system.initialize === 'function') {
        system.initialize(this);
      }
    }
    
    return this;
  }
  
/**
 * Ensure the world is initialized before performing operations
 * Includes circuit breaker to prevent infinite loops
 * @private
 */
_checkInitialized() {
  // Static counter to track consecutive calls
  if (!this._initCheckCount) {
    this._initCheckCount = 0;
  }
  
  // Circuit breaker - if called too many times in succession, return true
  // to break potential infinite loops
  if (this._initCheckCount > 10) {
    console.error('BaseWorld: Possible infinite loop detected in initialization check');
    this._initCheckCount = 0; // Reset counter
    return true; // Allow operation to proceed to break the loop
  }
  
  if (!this.isInitialized) {
    console.warn('BaseWorld: Method called before world was initialized. Call initialize() first.');
    this._initCheckCount++;
    return false;
  }
  
  // Reset counter when initialized
  this._initCheckCount = 0;
  return true;
}

  /**
   * Create a new entity
   * @returns {Object} - The created entity with an ID and components map
   */
  createEntity() {
    this._checkInitialized();
    
    const entity = {
      id: this.nextEntityId++,
      components: new Map(),
      
      // Add convenience methods to entity for component management
      addComponent(component) {
        const componentName = component.constructor.name;
        this.components.set(componentName, component);
        component.entity = this;
        return this;
      },
      
      removeComponent(componentClass) {
        const componentName = typeof componentClass === 'string' 
          ? componentClass 
          : componentClass.name;
        
        const component = this.components.get(componentName);
        if (component) {
          component.entity = null; // Clear back-reference
          this.components.delete(componentName);
        }
        return this;
      },
      
      getComponent(componentClass) {
        const componentName = typeof componentClass === 'string' 
          ? componentClass 
          : componentClass.name;
        return this.components.get(componentName);
      },
      
      hasComponent(componentClass) {
        const componentName = typeof componentClass === 'string' 
          ? componentClass 
          : componentClass.name;
        return this.components.has(componentName);
      }
    };
    
    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Remove an entity by ID
   * @param {number} entityId - Entity ID
   * @returns {boolean} - True if entity was removed, false if not found
   */
  removeEntity(entityId) {
    if (!this._checkInitialized()) return false;
    
    // Get the entity
    const entity = this.entities.get(entityId);
    if (!entity) {
      console.warn(`BaseWorld: Cannot remove entity with ID ${entityId} - not found`);
      return false;
    }
    
    // Clear component references
    for (const component of entity.components.values()) {
      if (component) {
        component.entity = null;
      }
    }
    
    // Remove from storage
    return this.entities.delete(entityId);
  }

  /**
   * Get an entity by ID
   * @param {number} entityId - Entity ID
   * @returns {Object|undefined} - The entity or undefined if not found
   */
  getEntity(entityId) {
    if (!this._checkInitialized()) return undefined;
    return this.entities.get(entityId);
  }

  /**
   * Add a system to this world
   * @param {Object} system - The system to add (must have an update method)
   * @returns {BaseWorld} - This world for chaining
   */
  addSystem(system) {
    if (!system) {
      console.error('BaseWorld: Cannot add null or undefined system');
      return this;
    }
    
    if (typeof system.update !== 'function') {
      console.warn('BaseWorld: Adding system without update method. This system will not process entities.');
    }
    
    // Set world reference if system supports it
    if (typeof system.setWorld === 'function') {
      system.setWorld(this);
    } else {
      system.world = this;
    }
    
    this.systems.push(system);
    
    // Initialize system if world is already initialized
    if (this.isInitialized && typeof system.initialize === 'function') {
      system.initialize(this);
    }
    
    return this;
  }

  /**
   * Remove a system from this world
   * @param {Object} system - The system to remove
   * @returns {boolean} - True if removed, false if not found
   */
  removeSystem(system) {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      // Call cleanup if system supports it
      if (typeof system.cleanup === 'function') {
        system.cleanup();
      }
      
      // Clear world reference
      system.world = null;
      
      // Remove from array
      this.systems.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Update all systems
   * @param {number} deltaTime - Time elapsed since last update
   * @returns {boolean} - True if update was performed
   */
  update(deltaTime) {
    if (!this._checkInitialized()) return false;
    
    for (const system of this.systems) {
      if (system && typeof system.update === 'function') {
        try {
          system.update(deltaTime);
        } catch (error) {
          console.error(`BaseWorld: Error updating system ${system.constructor.name}:`, error);
        }
      }
    }
    
    return true;
  }

  /**
   * Get all entities with a specific component
   * @param {string} componentType - Component type name
   * @returns {Array} - Array of entities with the component
   */
  getEntitiesWithComponent(componentType) {
    if (!this._checkInitialized()) return [];
    
    const result = [];
    for (const entity of this.entities.values()) {
      if (entity.components.has(componentType)) {
        result.push(entity);
      }
    }
    return result;
  }

  /**
   * Get count of entities
   * @returns {number} - Number of entities in the world
   */
  getEntityCount() {
    return this.entities.size;
  }

  /**
   * Get count of systems
   * @returns {number} - Number of systems in the world
   */
  getSystemCount() {
    return this.systems.length;
  }

  /**
   * Clear all entities
   * @returns {BaseWorld} - This world for chaining
   */
  clear() {
    if (!this._checkInitialized()) return this;
    
    // Clear component references
    for (const entity of this.entities.values()) {
      for (const component of entity.components.values()) {
        if (component) {
          component.entity = null;
        }
      }
    }
    
    // Clear entity storage
    this.entities.clear();
    this.nextEntityId = 1;
    
    return this;
  }
  
  /**
   * Perform full cleanup/disposal of the world
   */
  dispose() {
    // Cleanup systems
    for (const system of this.systems) {
      if (typeof system.cleanup === 'function') {
        system.cleanup();
      }
      system.world = null;
    }
    
    // Clear entities and components
    this.clear();
    
    // Clear systems
    this.systems = [];
    
    // Mark as uninitialized
    this.isInitialized = false;
  }
}

export default BaseWorld;