import SimulationAdapter from '../core/SimulationAdapter';
import BaseWorld from '../core/BaseWorld';
import BaseComponent from '../core/BaseComponent';

// Position component
class PositionComponent extends BaseComponent {
  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

// Velocity component
class VelocityComponent extends BaseComponent {
  constructor(vx = 0, vy = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
  }
}

// Appearance component
class AppearanceComponent extends BaseComponent {
  constructor(color = '#00ff00', size = 5) {
    super();
    this.color = color;
    this.size = size;
  }
}

// Food component
class FoodComponent extends BaseComponent {
  constructor(energy = 50) {
    super();
    this.energy = energy;
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

// Rendering system
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
      // Clear canvas
      const canvas = this.context.canvas;
      this.context.clearRect(0, 0, canvas.width / (this.context.pixelRatio || 1), 
                               canvas.height / (this.context.pixelRatio || 1));
      
      // Render entities
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      for (const entity of entities) {
        const position = entity.getComponent('PositionComponent');
        if (!position) continue;
        
        if (entity.hasComponent('FoodComponent')) {
          // Draw food
          this.context.beginPath();
          this.context.arc(position.x, position.y, 2, 0, Math.PI * 2);
          this.context.fillStyle = '#ffff00';
          this.context.fill();
        } else {
          // Draw organism
          const appearance = entity.getComponent('AppearanceComponent');
          if (!appearance) continue;
          
          this.context.beginPath();
          this.context.arc(position.x, position.y, appearance.size, 0, Math.PI * 2);
          this.context.fillStyle = appearance.color;
          this.context.fill();
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
        return { generation: this.generation };
      }
      
      const organisms = this.world.getEntitiesWithComponent('PositionComponent')
        .filter(e => !e.hasComponent('FoodComponent'));
      
      const food = this.world.getEntitiesWithComponent('FoodComponent');
      
      return {
        generation: this.generation,
        organismCount: organisms.length,
        foodCount: food.length,
        entityCount: this.world.getEntityCount()
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { generation: this.generation };
    }
  }
}

export default SimpleSimulation;