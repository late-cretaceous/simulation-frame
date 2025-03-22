/**
 * Base class for all systems
 * Systems contain logic that processes entities with specific components
 */
export class BaseSystem {
    /**
     * Create a new system
     * @param {Object} world - Reference to the world this system belongs to
     */
    constructor(world) {
      this.world = world;
    }
  
    /**
     * Update method called every frame
     * Override in derived systems to implement specific behavior
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
      // Override in derived systems
    }
  }
  
  export default BaseSystem;