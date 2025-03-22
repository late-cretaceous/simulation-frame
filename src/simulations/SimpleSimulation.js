import SimulationAdapter from '../core/SimulationAdapter';
import BaseWorld from '../core/BaseWorld';
import BaseEntity from '../core/BaseEntity';
import BaseComponent from '../core/BaseComponent';
import BaseSystem from '../core/BaseSystem';

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

// Energy component
class EnergyComponent extends BaseComponent {
  constructor(energy = 100, maxEnergy = 100) {
    super();
    this.energy = energy;
    this.maxEnergy = maxEnergy;
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
class PhysicsSystem extends BaseSystem {
  constructor(world) {
    super(world);
    this.worldWidth = 800;
    this.worldHeight = 600;
  }
  
  update(deltaTime) {
    const entities = this.world.getEntitiesWithComponent('PositionComponent');
    
    for (const entity of entities) {
      if (entity.components.has('VelocityComponent')) {
        const position = entity.components.get('PositionComponent');
        const velocity = entity.components.get('VelocityComponent');
        
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
  }
}

// Rendering system
class RenderingSystem extends BaseSystem {
  constructor(world, context) {
    super(world);
    this.context = context;
  }
  
  update() {
    if (!this.context) return;
    
    // Clear canvas
    const canvas = this.context.canvas;
    this.context.clearRect(0, 0, canvas.width / (this.context.pixelRatio || 1), 
                                 canvas.height / (this.context.pixelRatio || 1));
    
    // Render organisms
    const entities = this.world.getEntitiesWithComponent('PositionComponent');
    
    for (const entity of entities) {
      const position = entity.components.get('PositionComponent');
      if (!position) continue;
      
      if (entity.components.has('FoodComponent')) {
        // Draw food
        this.context.beginPath();
        this.context.arc(position.x, position.y, 2, 0, Math.PI * 2);
        this.context.fillStyle = '#ffff00';
        this.context.fill();
      } else {
        // Draw organism
        const appearance = entity.components.get('AppearanceComponent');
        if (!appearance) continue;
        
        this.context.beginPath();
        this.context.arc(position.x, position.y, appearance.size, 0, Math.PI * 2);
        this.context.fillStyle = appearance.color;
        this.context.fill();
      }
    }
  }
}

// Simple simulation adapter
export class SimpleSimulation extends SimulationAdapter {
  constructor() {
    super();
    this.world = new BaseWorld();
    this.context = null;
    this.width = 800;
    this.height = 600;
    this.isPaused = false;
    this.generation = 0;
    this.parameters = {
      organismCount: 20,
      foodAmount: 50,
      speed: 1.0,
      entitySize: 5
    };
  }
  
  initialize(canvasContext, width, height) {
    this.context = canvasContext;
    this.width = width / (canvasContext.pixelRatio || 1);
    this.height = height / (canvasContext.pixelRatio || 1);
    
    // Initialize systems
    const physicsSystem = new PhysicsSystem(this.world);
    physicsSystem.worldWidth = this.width;
    physicsSystem.worldHeight = this.height;
    
    const renderingSystem = new RenderingSystem(this.world, this.context);
    
    this.world.addSystem(physicsSystem);
    this.world.addSystem(renderingSystem);
    
    // Create initial entities
    this.reset();
  }
  
  update(deltaTime) {
    if (this.isPaused) return;
    
    // Apply speed multiplier
    const adjustedDelta = deltaTime * this.parameters.speed;
    
    // Update world
    this.world.update(adjustedDelta);
    
    // Occasionally increase generation
    if (Math.random() < 0.001 * adjustedDelta) {
      this.generation++;
    }
  }
  
  getEntitiesForMinimap() {
    const organisms = [];
    const food = [];
    
    // Get organism positions
    const entityPositions = this.world.getEntitiesWithComponent('PositionComponent');
    
    for (const entity of entityPositions) {
      const position = entity.components.get('PositionComponent');
      
      if (entity.components.has('FoodComponent')) {
        food.push({ x: position.x, y: position.y });
      } else {
        organisms.push({ x: position.x, y: position.y });
      }
    }
    
    return { organisms, food };
  }
  
  selectEntityAt(x, y, viewportInfo) {
    const { offset, scale } = viewportInfo;
    
    // Convert screen coordinates to world coordinates
    const worldX = (x - offset.x) / scale;
    const worldY = (y - offset.y) / scale;
    
    // Find closest entity
    const entities = this.world.getEntitiesWithComponent('PositionComponent');
    let closestEntity = null;
    let closestDistance = Infinity;
    
    for (const entity of entities) {
      // Skip food entities
      if (entity.components.has('FoodComponent')) continue;
      
      const position = entity.components.get('PositionComponent');
      const appearance = entity.components.get('AppearanceComponent');
      
      if (!position || !appearance) continue;
      
      // Calculate distance
      const dx = position.x - worldX;
      const dy = position.y - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if within entity bounds and closer than current closest
      if (distance <= appearance.size && distance < closestDistance) {
        closestEntity = entity;
        closestDistance = distance;
      }
    }
    
    if (closestEntity) {
      // Return a simple object with entity data
      const position = closestEntity.components.get('PositionComponent');
      const appearance = closestEntity.components.get('AppearanceComponent');
      const velocity = closestEntity.components.get('VelocityComponent');
      const energy = closestEntity.components.get('EnergyComponent');
      
      return {
        id: closestEntity.id,
        x: position.x,
        y: position.y,
        size: appearance.size,
        color: appearance.color,
        speed: Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy),
        energy: energy ? energy.energy : null,
        maxEnergy: energy ? energy.maxEnergy : null
      };
    }
    
    return null;
  }
  
  getStatistics() {
    const entities = this.world.getEntitiesWithComponent('PositionComponent');
    const organisms = entities.filter(e => !e.components.has('FoodComponent'));
    const food = entities.filter(e => e.components.has('FoodComponent'));
    
    return {
      generation: this.generation,
      organismCount: organisms.length,
      foodCount: food.length,
      entityCount: entities.length
    };
  }
  
  getParameters() {
    return this.parameters;
  }
  
  setParameter(key, value) {
    if (key in this.parameters) {
      this.parameters[key] = value;
      
      // Handle dynamic parameter changes
      if (key === 'organismCount') {
        this.updateOrganismCount(value);
      } else if (key === 'foodAmount') {
        this.updateFoodAmount(value);
      } else if (key === 'entitySize') {
        this.updateEntitySize(value);
      }
    }
  }
  
  updateOrganismCount(count) {
    const entities = this.world.getEntitiesWithComponent('PositionComponent');
    const organisms = entities.filter(e => !e.components.has('FoodComponent'));
    
    // If we need more organisms
    while (organisms.length < count) {
      this.createOrganism();
      organisms.push({});
    }
    
    // If we need fewer organisms
    while (organisms.length > count && organisms.length > 0) {
      const entity = organisms[organisms.length - 1];
      this.world.removeEntity(entity.id);
      organisms.pop();
    }
  }
  
  updateFoodAmount(amount) {
    const entities = this.world.getEntitiesWithComponent('FoodComponent');
    
    // If we need more food
    while (entities.length < amount) {
      this.createFood();
      entities.push({});
    }
    
    // If we need less food
    while (entities.length > amount && entities.length > 0) {
      const entity = entities[entities.length - 1];
      this.world.removeEntity(entity.id);
      entities.pop();
    }
  }
  
  updateEntitySize(size) {
    const entities = this.world.getEntitiesWithComponent('AppearanceComponent');
    
    for (const entity of entities) {
      if (!entity.components.has('FoodComponent')) {
        const appearance = entity.components.get('AppearanceComponent');
        appearance.size = size;
      }
    }
  }
  
  createOrganism() {
    const entity = this.world.createEntity();
    
    // Random position
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    const positionComponent = new PositionComponent(x, y);
    entity.components.set(positionComponent.constructor.name, positionComponent);
    positionComponent.entity = entity;
    
    // Random velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 30;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const velocityComponent = new VelocityComponent(vx, vy);
    entity.components.set(velocityComponent.constructor.name, velocityComponent);
    velocityComponent.entity = entity;
    
    // Appearance
    const hue = Math.random() * 360;
    const color = `hsl(${hue}, 80%, 50%)`;
    const appearanceComponent = new AppearanceComponent(color, this.parameters.entitySize);
    entity.components.set(appearanceComponent.constructor.name, appearanceComponent);
    appearanceComponent.entity = entity;
    
    // Energy
    const energyComponent = new EnergyComponent(100, 100);
    entity.components.set(energyComponent.constructor.name, energyComponent);
    energyComponent.entity = entity;
    
    return entity;
  }
  
  createFood() {
    const entity = this.world.createEntity();
    
    // Random position
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    const positionComponent = new PositionComponent(x, y);
    entity.components.set(positionComponent.constructor.name, positionComponent);
    positionComponent.entity = entity;
    
    // Food component
    const foodComponent = new FoodComponent();
    entity.components.set(foodComponent.constructor.name, foodComponent);
    foodComponent.entity = entity;
    
    return entity;
  }
  
  pause() {
    this.isPaused = true;
  }
  
  resume() {
    this.isPaused = false;
  }
  
  reset() {
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
  }
  
  saveState() {
    // Return serializable state
    return {
      generation: this.generation,
      parameters: { ...this.parameters }
    };
  }
  
  loadState(state) {
    if (!state) return false;
    
    // Load saved state
    if (state.generation !== undefined) {
      this.generation = state.generation;
    }
    
    if (state.parameters) {
      this.parameters = { ...this.parameters, ...state.parameters };
    }
    
    // Reset with new parameters
    this.reset();
    
    return true;
  }
  
  saveEntityToLibrary(entity, name, notes) {
    if (!entity) return null;
    
    // Create a copy with additional metadata
    const savedEntity = {
      ...entity,
      name,
      notes,
      savedAt: Date.now()
    };
    
    // Get existing saved entities
    let savedEntities = [];
    try {
      const saved = localStorage.getItem('saved-organisms');
      if (saved) {
        savedEntities = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved organisms:', error);
    }
    
    // Add new entity
    savedEntities.push(savedEntity);
    
    // Save to localStorage
    try {
      localStorage.setItem('saved-organisms', JSON.stringify(savedEntities));
    } catch (error) {
      console.error('Failed to save organism:', error);
      return null;
    }
    
    return savedEntity;
  }
  
  loadEntitiesFromLibrary() {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('saved-organisms');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load saved organisms:', error);
    }
    
    return [];
  }
}

export default SimpleSimulation;