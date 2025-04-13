import SimulationAdapter from '../core/SimulationAdapter';
import BaseWorld from '../core/BaseWorld';
import BaseComponent from '../core/BaseComponent';

// Enhanced Position component with validation
class PositionComponent extends BaseComponent {
  constructor(x = 0, y = 0) {
    super();
    this._x = typeof x === 'number' && !isNaN(x) ? x : 0;
    this._y = typeof y === 'number' && !isNaN(y) ? y : 0;
  }
  
  // Safe getters with validation
  get x() {
    return typeof this._x === 'number' ? this._x : 0;
  }
  
  get y() {
    return typeof this._y === 'number' ? this._y : 0;
  }
  
  // Setters with validation
  set x(value) {
    this._x = typeof value === 'number' && !isNaN(value) ? value : this._x;
  }
  
  set y(value) {
    this._y = typeof value === 'number' && !isNaN(value) ? value : this._y;
  }
  
  // Helper methods
  getPosition() {
    return { x: this.x, y: this.y };
  }
}

// Enhanced Velocity component with validation
class VelocityComponent extends BaseComponent {
  constructor(vx = 0, vy = 0) {
    super();
    this._vx = typeof vx === 'number' && !isNaN(vx) ? vx : 0;
    this._vy = typeof vy === 'number' && !isNaN(vy) ? vy : 0;
  }
  
  // Safe getters with validation
  get vx() {
    return typeof this._vx === 'number' ? this._vx : 0;
  }
  
  get vy() {
    return typeof this._vy === 'number' ? this._vy : 0;
  }
  
  // Setters with validation
  set vx(value) {
    this._vx = typeof value === 'number' && !isNaN(value) ? value : this._vx;
  }
  
  set vy(value) {
    this._vy = typeof value === 'number' && !isNaN(value) ? value : this._vy;
  }
  
  // Helper method to get speed
  getSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }
}

// Enhanced Appearance component with validation
class AppearanceComponent extends BaseComponent {
  constructor(color = '#00ff00', size = 5) {
    super();
    this._color = typeof color === 'string' ? color : '#00ff00';
    this._size = typeof size === 'number' && !isNaN(size) && size > 0 ? size : 5;
  }
  
  // Safe getters with validation
  get color() {
    return typeof this._color === 'string' ? this._color : '#00ff00';
  }
  
  get size() {
    return typeof this._size === 'number' && this._size > 0 ? this._size : 5;
  }
  
  // Setters with validation
  set color(value) {
    this._color = typeof value === 'string' ? value : this._color;
  }
  
  set size(value) {
    this._size = typeof value === 'number' && !isNaN(value) && value > 0 ? value : this._size;
  }
}

// Enhanced Food component with validation
class FoodComponent extends BaseComponent {
  constructor(energy = 50) {
    super();
    this._energy = typeof energy === 'number' && !isNaN(energy) ? energy : 50;
    this.type = 'food';
  }
  
  // Safe getter with validation
  get energy() {
    return typeof this._energy === 'number' ? this._energy : 50;
  }
  
  // Setter with validation
  set energy(value) {
    this._energy = typeof value === 'number' && !isNaN(value) ? value : this._energy;
  }
}

// Physics system
class PhysicsSystem {
  constructor() {
    this.world = null;
    this.worldWidth = 800;
    this.worldHeight = 600;
  }
  
  // Store world reference
  setWorld(world) {
    this.world = world;
  }
  
  update(deltaTime) {
    // Skip if world is not set
    if (!this.world) return;
    
    try {
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      for (const entity of entities) {
        if (entity.hasComponent('VelocityComponent')) {
          const position = entity.getComponent('PositionComponent');
          const velocity = entity.getComponent('VelocityComponent');
          
          // Update position based on velocity
          position.x += velocity.vx * deltaTime;
          position.y += velocity.vy * deltaTime;
          
          // Bounce off world boundaries
          if (position.x < 0 || position.x > this.worldWidth) {
            velocity.vx *= -1;
            position.x = Math.max(0, Math.min(position.x, this.worldWidth));
          }
          
          if (position.y < 0 || position.y > this.worldHeight) {
            velocity.vy *= -1;
            position.y = Math.max(0, Math.min(position.y, this.worldHeight));
          }
        }
      }
    } catch (error) {
      console.error('PhysicsSystem update error:', error);
    }
  }
}

// Rendering system with proper canvas clearing
class RenderingSystem {
  constructor() {
    this.world = null;
    this.context = null;
  }
  
  // Initialize with context
  initialize(context) {
    this.context = context;
  }
  
  // Store world reference
  setWorld(world) {
    this.world = world;
  }
  
  update() {
    // Skip if world or context is not set
    if (!this.world || !this.context) return;
    
    try {
      const ctx = this.context;
      const canvas = ctx.canvas;
      
      // Save the current transformation state
      ctx.save();
      
      // Reset the transformation matrix to identity
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Clear the entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Restore the transformation state for drawing
      ctx.restore();
      
      // Render entities
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      for (const entity of entities) {
        const position = entity.getComponent('PositionComponent');
        if (!position) continue;
        
        if (entity.hasComponent('FoodComponent')) {
          // Draw food
          ctx.beginPath();
          ctx.arc(position.x, position.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffff00';
          ctx.fill();
        } else {
          // Draw organism
          const appearance = entity.getComponent('AppearanceComponent');
          if (!appearance) continue;
          
          ctx.beginPath();
          ctx.arc(position.x, position.y, appearance.size, 0, Math.PI * 2);
          ctx.fillStyle = appearance.color;
          ctx.fill();
        }
      }
    } catch (error) {
      console.error('RenderingSystem update error:', error);
    }
  }
}

// Simple simulation adapter
export class SimpleSimulation extends SimulationAdapter {
  constructor() {
    super();
    
    // Initialize parameters
    this.parameters = {
      organismCount: 20,
      foodAmount: 50,
      speed: 1.0,
      entitySize: 5
    };
    
    // Create systems (but don't connect to world yet)
    this.physicsSystem = new PhysicsSystem();
    this.renderingSystem = new RenderingSystem();
    
    // Track generation
    this.generation = 0;
  }
  
  initialize(canvasContext, width, height) {
    // Call parent initialize first - this creates and initializes the world
    if (!super.initialize(canvasContext, width, height)) {
      return false;
    }
    
    // Now world is initialized, we can complete our setup
    this.physicsSystem.worldWidth = this.width;
    this.physicsSystem.worldHeight = this.height;
    this.renderingSystem.initialize(this.context);
    
    return true;
  }
  
  // Override the _setupSystems method that's called after world initialization
  _setupSystems() {
    // Now it's safe to connect systems to world
    this.physicsSystem.setWorld(this.world);
    this.renderingSystem.setWorld(this.world);
    
    // Add systems to world
    this.world.addSystem(this.physicsSystem);
    this.world.addSystem(this.renderingSystem);
    
    // Create initial entities
    this.reset();
  }
  
  update(deltaTime) {
    if (this.isPaused) return false;
    
    try {
      // Apply speed multiplier
      const adjustedDelta = deltaTime * this.parameters.speed;
      
      // Update world - this will update all systems
      if (this.world && this.isInitialized) {
        this.world.update(adjustedDelta);
      }
      
      // Occasionally increase generation
      if (Math.random() < 0.001 * adjustedDelta) {
        this.generation++;
      }
      
      return true;
    } catch (error) {
      console.error('SimpleSimulation update error:', error);
      return false;
    }
  }
  
  getEntitiesForMinimap() {
    const organisms = [];
    const food = [];
    
    try {
      // Skip if world is not initialized
      if (!this.world || !this.isInitialized) {
        return { organisms, food };
      }
      
      // Get entity positions
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      for (const entity of entities) {
        const position = entity.getComponent('PositionComponent');
        if (!position) continue;
        
        if (entity.hasComponent('FoodComponent')) {
          food.push({ x: position.x, y: position.y });
        } else {
          organisms.push({ x: position.x, y: position.y });
        }
      }
    } catch (error) {
      console.error('Error getting minimap entities:', error);
    }
    
    return { organisms, food };
  }
  
  // Other methods implementing SimulationAdapter interface...
  
  // The most important method - reset/create entities
  reset() {
    try {
      // Skip if world is not initialized
      if (!this.world || !this.isInitialized) {
        return false;
      }
      
      // Clear existing entities
      this.world.clear();
      this.generation = 0;
      
      // Create organisms
      for (let i = 0; i < this.parameters.organismCount; i++) {
        this.createOrganism();
      }
      
      // Create food
      for (let i = 0; i < this.parameters.foodAmount; i++) {
        this.createFood();
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting simulation:', error);
      return false;
    }
  }
  
  createOrganism() {
    try {
      // Skip if world is not initialized
      if (!this.world || !this.isInitialized) {
        return null;
      }
      
      const entity = this.world.createEntity();
      
      // Random position
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      entity.addComponent(new PositionComponent(x, y));
      
      // Random velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 30;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      entity.addComponent(new VelocityComponent(vx, vy));
      
      // Appearance
      const hue = Math.random() * 360;
      const color = `hsl(${hue}, 80%, 50%)`;
      entity.addComponent(new AppearanceComponent(color, this.parameters.entitySize));
      
      return entity;
    } catch (error) {
      console.error('Error creating organism:', error);
      return null;
    }
  }
  
  createFood() {
    try {
      // Skip if world is not initialized
      if (!this.world || !this.isInitialized) {
        return null;
      }
      
      const entity = this.world.createEntity();
      
      // Random position
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      entity.addComponent(new PositionComponent(x, y));
      
      // Food component
      entity.addComponent(new FoodComponent());
      
      return entity;
    } catch (error) {
      console.error('Error creating food:', error);
      return null;
    }
  }
  
  // Implementation of other required methods for SimulationAdapter...
  
  getStatistics() {
    try {
      if (!this.world || !this.isInitialized) {
        return { generation: this.generation || 0 };
      }
      
      // Get entities with safe filtering
      const allEntities = Array.from(this.world.entities.values());
      const organisms = allEntities.filter(e => e && !e.hasComponent('FoodComponent'));
      const food = allEntities.filter(e => e && e.hasComponent('FoodComponent'));
      
      // Calculate average speed safely
      let totalSpeed = 0;
      let validVelocityCount = 0;
      
      for (const entity of organisms) {
        // Get velocity component safely
        const velocity = entity.getComponentSafe ? 
          entity.getComponentSafe('VelocityComponent') : 
          entity.getComponent('VelocityComponent');
        
        // Check if velocity exists and has valid properties or methods
        if (velocity && typeof velocity.getSpeed === 'function') {
          // Use the getSpeed method if available
          totalSpeed += velocity.getSpeed();
          validVelocityCount++;
        } else if (velocity && 
                 typeof velocity.vx === 'number' && 
                 typeof velocity.vy === 'number') {
          // Calculate speed manually if getSpeed isn't available
          const speed = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
          totalSpeed += speed;
          validVelocityCount++;
        }
        // Skip entities with missing or invalid velocity components
      }
      
      // Calculate average based on valid velocities
      const averageSpeed = validVelocityCount > 0 ? totalSpeed / validVelocityCount : 0;
      
      return {
        generation: this.generation || 0,
        organismCount: organisms.length,
        foodCount: food.length,
        entityCount: this.world.getEntityCount(),
        averageSpeed: averageSpeed
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { 
        generation: this.generation || 0,
        organismCount: 0,
        foodCount: 0,
        entityCount: 0,
        averageSpeed: 0
      };
    }
  }
}

export default SimpleSimulation;