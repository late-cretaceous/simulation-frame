/**
 * Base class for simulation worlds
 * Provides entity management and system updates
 */
export class BaseWorld {
    constructor() {
      this.entities = new Map();
      this.systems = [];
      this.nextEntityId = 1;
    }
  
    /**
     * Create a new entity
     * @returns {Object} - The created entity
     */
    createEntity() {
      const entity = {
        id: this.nextEntityId++,
        components: new Map()
      };
      this.entities.set(entity.id, entity);
      return entity;
    }
  
    /**
     * Remove an entity
     * @param {number} entityId - Entity ID
     */
    removeEntity(entityId) {
      this.entities.delete(entityId);
    }
  
    /**
     * Get an entity by ID
     * @param {number} entityId - Entity ID
     * @returns {Object|undefined} - The entity or undefined if not found
     */
    getEntity(entityId) {
      return this.entities.get(entityId);
    }
  
    /**
     * Add a system to this world
     * @param {Object} system - The system to add
     * @returns {BaseWorld} - This world for chaining
     */
    addSystem(system) {
      this.systems.push(system);
      return this;
    }
  
    /**
     * Update all systems
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
      for (const system of this.systems) {
        system.update(deltaTime);
      }
    }
  
    /**
     * Get all entities with a specific component
     * @param {string} componentType - Component type name
     * @returns {Array} - Array of entities with the component
     */
    getEntitiesWithComponent(componentType) {
      const result = [];
      for (const entity of this.entities.values()) {
        if (entity.components.has(componentType)) {
          result.push(entity);
        }
      }
      return result;
    }
  
    /**
     * Clear all entities
     */
    clear() {
      this.entities.clear();
      this.nextEntityId = 1;
    }
  }
  
  export default BaseWorld;