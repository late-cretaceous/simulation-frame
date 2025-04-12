/**
 * RobustSimulationTemplate.js
 * 
 * A complete, ready-to-use simulation template with:
 * - Self-checking initialization
 * - Comprehensive error handling
 * - Automatic recovery mechanisms
 * - Working implementations of all required methods
 * 
 * This template can be used with ZERO modifications and will produce
 * a functional simulation. You can then customize it step by step.
 */

import SimulationAdapter from '../core/SimulationAdapter';
import BaseWorld from '../core/BaseWorld';
import BaseComponent from '../core/BaseComponent';
import CanvasRenderer from '../utils/CanvasRenderer';

// =========================================
// COMPONENT CLASSES
// =========================================

// Position component - Stores entity position
class PositionComponent extends BaseComponent {
  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

// Velocity component - Stores entity movement velocity
class VelocityComponent extends BaseComponent {
  constructor(vx = 0, vy = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
  }
}

// Appearance component - Stores entity visual properties
class AppearanceComponent extends BaseComponent {
  constructor(color = '#00ff00', size = 5) {
    super();
    this.color = color;
    this.size = size;
  }
}

// Food component - Tags entity as food
class FoodComponent extends BaseComponent {
  constructor(energy = 50) {
    super();
    this.energy = energy;
    this.type = 'food';
  }
}

// =========================================
// SYSTEM CLASSES
// =========================================

// Physics system - Updates entity positions based on velocity
class PhysicsSystem {
  constructor(world, worldWidth, worldHeight) {
    this.world = world;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }
  
  // Set the world reference
  setWorld(world) {
    this.world = world;
  }
  
  // Update method called each frame
  update(deltaTime) {
    if (!this.world) return; // Safety check
    
    try {
      // Get all entities with position
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      // Update each entity with velocity
      for (const entity of entities) {
        if (entity.hasComponent('VelocityComponent')) {
          const position = entity.getComponent('PositionComponent');
          const velocity = entity.getComponent('VelocityComponent');
          
          // Update position based on velocity
          position.x += velocity.vx * deltaTime;
          position.y += velocity.vy * deltaTime;
          
          // Bounce off world boundaries
          if (position.x < 0) {
            position.x = 0;
            velocity.vx *= -1;
          } else if (position.x > this.worldWidth) {
            position.x = this.worldWidth;
            velocity.vx *= -1;
          }
          
          if (position.y < 0) {
            position.y = 0;
            velocity.vy *= -1;
          } else if (position.y > this.worldHeight) {
            position.y = this.worldHeight;
            velocity.vy *= -1;
          }
        }
      }
    } catch (error) {
      console.error('PhysicsSystem update error:', error);
    }
  }
}

// Rendering system - Draws entities on canvas
class RenderingSystem {
  constructor(world, context) {
    this.world = world;
    this.context = context;
    this.renderer = null;
  }
  
  // Initialize with context
  initialize(context) {
    this.context = context;
    if (context && context.canvas) {
      this.renderer = new CanvasRenderer(context.canvas, context);
    }
  }
  
  // Set the world reference
  setWorld(world) {
    this.world = world;
  }
  
  // Update method called each frame
  update() {
    if (!this.world || !this.context) return; // Safety check
    
    try {
      // Clear the canvas first
      if (this.renderer) {
        this.renderer.beginFrame();
      } else {
        const ctx = this.context;
        const canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Get all entities with position
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      // Draw each entity
      for (const entity of entities) {
        const position = entity.getComponent('PositionComponent');
        
        if (entity.hasComponent('FoodComponent')) {
          // Draw food entities
          if (this.renderer) {
            this.renderer.drawCircle(position.x, position.y, 2, '#ffff00');
          } else {
            this.context.beginPath();
            this.context.arc(position.x, position.y, 2, 0, Math.PI * 2);
            this.context.fillStyle = '#ffff00';
            this.context.fill();
          }
        } else if (entity.hasComponent('AppearanceComponent')) {
          // Draw normal entities
          const appearance = entity.getComponent('AppearanceComponent');
          
          if (this.renderer) {
            this.renderer.drawCircle(position.x, position.y, appearance.size, appearance.color);
          } else {
            this.context.beginPath();
            this.context.arc(position.x, position.y, appearance.size, 0, Math.PI * 2);
            this.context.fillStyle = appearance.color;
            this.context.fill();
          }
        }
      }
      
      if (this.renderer) {
        this.renderer.endFrame();
      }
    } catch (error) {
      console.error('RenderingSystem update error:', error);
    }
  }
}

// =========================================
// ROBUST SIMULATION TEMPLATE
// =========================================

export class RobustSimulationTemplate extends SimulationAdapter {
  /**
   * Create a new simulation instance
   */
  constructor() {
    super();
    
    // Core state properties
    this._isWorldInitialized = false;
    this._isSimulationInitialized = false;
    this._initializeAttempts = 0;
    this._lastError = null;
    
    // Create a world instance
    this.world = new BaseWorld();
    
    // Create systems
    this.physicsSystem = new PhysicsSystem(null, 800, 600);
    this.renderingSystem = new RenderingSystem(null, null);
    
    // Basic simulation state
    this.generation = 0;
    this.generationTimer = 0;
    this.isPaused = false;
    
    // Default parameters
    this.parameters = {
      // Simulation parameters
      speed: 1.0,
      generationTime: 10.0, // Seconds per generation
      
      // Entity parameters
      organismCount: 20,
      foodAmount: 30,
      entitySize: 5,
      foodEnergy: 50,
      
      // Display parameters
      showDebugInfo: false,
    };
    
    // Parameter metadata (for UI controls)
    this.parameterMetadata = {
      speed: {
        type: 'number',
        label: 'Simulation Speed',
        min: 0.1,
        max: 10.0,
        step: 0.1,
        description: 'Controls how fast the simulation runs'
      },
      generationTime: {
        type: 'number',
        label: 'Generation Time',
        min: 1.0,
        max: 60.0,
        step: 1.0,
        description: 'Time in seconds before generation increases'
      },
      organismCount: {
        type: 'number',
        label: 'Organism Count',
        min: 1,
        max: 200,
        step: 1,
        description: 'Number of organisms in the simulation'
      },
      foodAmount: {
        type: 'number',
        label: 'Food Amount',
        min: 0,
        max: 500,
        step: 5,
        description: 'Amount of food in the simulation'
      },
      entitySize: {
        type: 'number',
        label: 'Entity Size',
        min: 1,
        max: 20,
        step: 1,
        description: 'Visual size of organisms'
      },
      showDebugInfo: {
        type: 'boolean',
        label: 'Show Debug Info',
        description: 'Display debug information on the canvas'
      }
    };
    
    // Saved entities library
    this.entityLibrary = [];
  }
  
  /**
   * Initialize the simulation
   * This is called once when the simulation is first created
   */
  initialize(canvasContext, width, height) {
    try {
      // Store context and dimensions
      this.context = canvasContext;
      this.width = width || 800;
      this.height = height || 600;
      
      // Update physics system dimensions
      this.physicsSystem.worldWidth = this.width;
      this.physicsSystem.worldHeight = this.height;
      
      // Initialize rendering system
      this.renderingSystem.initialize(this.context);
      
      // Initialize world if not already initialized
      if (!this._isWorldInitialized) {
        this.world.initialize();
        this._isWorldInitialized = true;
      }
      
      // Connect systems to world
      this.physicsSystem.setWorld(this.world);
      this.renderingSystem.setWorld(this.world);
      
      // Add systems to world
      this.world.addSystem(this.physicsSystem);
      this.world.addSystem(this.renderingSystem);
      
      // Create initial entities
      this.reset();
      
      // Mark as initialized
      this._isSimulationInitialized = true;
      this.isInitialized = true;
      
      console.log('Simulation initialized successfully');
      return true;
    } catch (error) {
      this._lastError = {
        method: 'initialize',
        error: error,
        message: 'Failed to initialize simulation',
        time: new Date()
      };
      
      console.error('Simulation initialization error:', error);
      return false;
    }
  }
  
  /**
   * Update simulation state
   * This is called every frame
   */
  update(deltaTime) {
    // Check if initialized and not paused
    if (!this._isSimulationInitialized || this.isPaused) {
      return false;
    }
    
    try {
      // Apply speed parameter
      const adjustedDelta = deltaTime * this.parameters.speed;
      
      // Update generation timer
      this.generationTimer += adjustedDelta;
      if (this.generationTimer >= this.parameters.generationTime) {
        this.generation++;
        this.generationTimer = 0;
        
        // Add some food periodically
        this._addRandomFood(Math.floor(this.parameters.foodAmount / 10));
      }
      
      // Update world (this updates all systems)
      this.world.update(adjustedDelta);
      
      // Draw debug info if enabled
      if (this.parameters.showDebugInfo) {
        this._drawDebugInfo();
      }
      
      return true;
    } catch (error) {
      this._lastError = {
        method: 'update',
        error: error,
        message: 'Error during simulation update',
        time: new Date()
      };
      
      console.error('Simulation update error:', error);
      return false;
    }
  }
  
  /**
   * Get entity positions for the minimap
   */
  getEntitiesForMinimap() {
    if (!this._isSimulationInitialized) {
      return { organisms: [], food: [] };
    }
    
    try {
      const organisms = [];
      const food = [];
      
      // Get entities with position
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      // Sort entities into appropriate arrays
      for (const entity of entities) {
        const position = entity.getComponent('PositionComponent');
        
        if (entity.hasComponent('FoodComponent')) {
          food.push({ x: position.x, y: position.y });
        } else {
          organisms.push({ x: position.x, y: position.y });
        }
      }
      
      return { organisms, food };
    } catch (error) {
      console.error('Error getting minimap entities:', error);
      return { organisms: [], food: [] };
    }
  }
  
  /**
   * Select an entity at the given position
   */
  selectEntityAt(x, y, viewportInfo) {
    if (!this._isSimulationInitialized) {
      return null;
    }
    
    try {
      // Convert screen coordinates to world coordinates
      const worldX = (x - viewportInfo.offset.x) / viewportInfo.scale;
      const worldY = (y - viewportInfo.offset.y) / viewportInfo.scale;
      
      // Get entities with position
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      // Find the closest entity within selection range
      const selectionRange = this.parameters.entitySize * 1.5;
      let closestEntity = null;
      let closestDistance = Infinity;
      
      for (const entity of entities) {
        // Skip food entities for selection
        if (entity.hasComponent('FoodComponent')) continue;
        
        const position = entity.getComponent('PositionComponent');
        
        // Calculate distance
        const dx = position.x - worldX;
        const dy = position.y - worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if within range and closer than current closest
        if (distance <= selectionRange && distance < closestDistance) {
          closestEntity = entity;
          closestDistance = distance;
        }
      }
      
      // Return entity data if found
      if (closestEntity) {
        const position = closestEntity.getComponent('PositionComponent');
        const appearance = closestEntity.getComponent('AppearanceComponent');
        const velocity = closestEntity.getComponent('VelocityComponent');
        
        return {
          id: closestEntity.id,
          position: { x: position.x, y: position.y },
          velocity: { vx: velocity.vx, vy: velocity.vy },
          speed: Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy),
          size: appearance.size,
          color: appearance.color
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error selecting entity:', error);
      return null;
    }
  }
  
  /**
   * Get statistics about the simulation
   */
  getStatistics() {
    if (!this._isSimulationInitialized) {
      return { generation: this.generation };
    }
    
    try {
      // Get entities
      const allEntities = Array.from(this.world.entities.values());
      const organisms = allEntities.filter(e => !e.hasComponent('FoodComponent'));
      const food = allEntities.filter(e => e.hasComponent('FoodComponent'));
      
      // Calculate average speed
      let totalSpeed = 0;
      for (const entity of organisms) {
        const velocity = entity.getComponent('VelocityComponent');
        const speed = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
        totalSpeed += speed;
      }
      const averageSpeed = organisms.length > 0 ? totalSpeed / organisms.length : 0;
      
      // Return statistics
      return {
        generation: this.generation,
        organismCount: organisms.length,
        foodCount: food.length,
        totalEntities: allEntities.length,
        averageSpeed: averageSpeed,
        worldWidth: this.width,
        worldHeight: this.height
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { generation: this.generation };
    }
  }
  
  /**
   * Get configurable parameters
   */
  getParameters() {
    return { ...this.parameters };
  }
  
  /**
   * Get parameter metadata
   */
  getParameterMetadata() {
    return this.parameterMetadata;
  }
  
  /**
   * Set a parameter value
   */
  setParameter(key, value) {
    if (key in this.parameters) {
      // Store previous value for recovery
      const previousValue = this.parameters[key];
      
      try {
        // Update parameter
        this.parameters[key] = value;
        
        // Handle specific parameter changes
        switch (key) {
          case 'organismCount':
            this._updateOrganismCount(value);
            break;
          case 'entitySize':
            this._updateEntitySize(value);
            break;
        }
        
        return true;
      } catch (error) {
        // Restore previous value on error
        this.parameters[key] = previousValue;
        console.error(`Error setting parameter ${key}:`, error);
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Pause the simulation
   */
  pause() {
    this.isPaused = true;
    return true;
  }
  
  /**
   * Resume the simulation
   */
  resume() {
    this.isPaused = false;
    return true;
  }
  
  /**
   * Reset the simulation
   */
  reset() {
    try {
      // Clear the world
      this.world.clear();
      
      // Reset simulation state
      this.generation = 0;
      this.generationTimer = 0;
      
      // Create organisms
      for (let i = 0; i < this.parameters.organismCount; i++) {
        this._createOrganism();
      }
      
      // Create food
      for (let i = 0; i < this.parameters.foodAmount; i++) {
        this._createFood();
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting simulation:', error);
      return false;
    }
  }
  
  /**
   * Save the current simulation state
   */
  saveState() {
    try {
      // Create entity data
      const entityData = [];
      const organisms = Array.from(this.world.entities.values())
        .filter(e => !e.hasComponent('FoodComponent'));
      
      // Save organism data
      for (const entity of organisms) {
        const position = entity.getComponent('PositionComponent');
        const velocity = entity.getComponent('VelocityComponent');
        const appearance = entity.getComponent('AppearanceComponent');
        
        entityData.push({
          position: { x: position.x, y: position.y },
          velocity: { vx: velocity.vx, vy: velocity.vy },
          appearance: { color: appearance.color, size: appearance.size }
        });
      }
      
      // Save food positions
      const foodData = [];
      const food = Array.from(this.world.entities.values())
        .filter(e => e.hasComponent('FoodComponent'));
      
      for (const entity of food) {
        const position = entity.getComponent('PositionComponent');
        foodData.push({ x: position.x, y: position.y });
      }
      
      // Return state object
      return {
        timestamp: Date.now(),
        generation: this.generation,
        generationTimer: this.generationTimer,
        parameters: { ...this.parameters },
        entities: entityData,
        food: foodData
      };
    } catch (error) {
      console.error('Error saving state:', error);
      return {
        timestamp: Date.now(),
        generation: this.generation,
        parameters: { ...this.parameters }
      };
    }
  }
  
  /**
   * Load a saved simulation state
   */
  loadState(state) {
    if (!state) return false;
    
    try {
      // Ensure world is initialized
      if (!this._isWorldInitialized) {
        this.world.initialize();
        this._isWorldInitialized = true;
      }
      
      // Load generation
      if (state.generation !== undefined) {
        this.generation = state.generation;
      }
      
      // Load generation timer
      if (state.generationTimer !== undefined) {
        this.generationTimer = state.generationTimer;
      }
      
      // Load parameters
      if (state.parameters) {
        this.parameters = { ...this.parameters, ...state.parameters };
      }
      
      // Clear world
      this.world.clear();
      
      // Recreate entities
      if (state.entities && Array.isArray(state.entities)) {
        for (const entityData of state.entities) {
          this._createOrganism(
            entityData.position.x,
            entityData.position.y,
            entityData.velocity.vx,
            entityData.velocity.vy,
            entityData.appearance.color,
            entityData.appearance.size
          );
        }
      }
      
      // Recreate food
      if (state.food && Array.isArray(state.food)) {
        for (const foodData of state.food) {
          this._createFood(foodData.x, foodData.y);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error loading state:', error);
      return false;
    }
  }
  
  /**
   * Save an entity to the library
   */
  saveEntityToLibrary(entity, name, notes) {
    if (!entity) return null;
    
    try {
      // Create a copy with additional metadata
      const savedEntity = {
        ...entity,
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name: name || `Entity ${Date.now()}`,
        notes: notes || '',
        savedAt: Date.now()
      };
      
      // Add to library
      this.entityLibrary.push(savedEntity);
      
      // Save to localStorage if available
      try {
        localStorage.setItem('entity-library', JSON.stringify(this.entityLibrary));
      } catch (e) {
        // Local storage may not be available, continue anyway
      }
      
      return savedEntity;
    } catch (error) {
      console.error('Error saving entity to library:', error);
      return null;
    }
  }
  
  /**
   * Load entities from the library
   */
  loadEntitiesFromLibrary() {
    try {
      // Try to load from localStorage first
      try {
        const saved = localStorage.getItem('entity-library');
        if (saved) {
          this.entityLibrary = JSON.parse(saved);
        }
      } catch (e) {
        // Local storage may not be available, continue with in-memory library
      }
      
      return this.entityLibrary;
    } catch (error) {
      console.error('Error loading entity library:', error);
      return [];
    }
  }
  
  // =========================================
  // INTERNAL HELPER METHODS
  // =========================================
  
  /**
   * Create a new organism entity
   */
  _createOrganism(x, y, vx, vy, color, size) {
    if (!this._isWorldInitialized) {
      console.warn('Cannot create organism: World not initialized');
      return null;
    }
    
    try {
      // Create entity
      const entity = this.world.createEntity();
      
      // Position component
      const posX = x !== undefined ? x : Math.random() * this.width;
      const posY = y !== undefined ? y : Math.random() * this.height;
      entity.addComponent(new PositionComponent(posX, posY));
      
      // Velocity component
      let velX, velY;
      if (vx !== undefined && vy !== undefined) {
        velX = vx;
        velY = vy;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        velX = Math.cos(angle) * speed;
        velY = Math.sin(angle) * speed;
      }
      entity.addComponent(new VelocityComponent(velX, velY));
      
      // Appearance component
      const entityColor = color || `hsl(${Math.random() * 360}, 80%, 50%)`;
      const entitySize = size !== undefined ? size : this.parameters.entitySize;
      entity.addComponent(new AppearanceComponent(entityColor, entitySize));
      
      return entity;
    } catch (error) {
      console.error('Error creating organism:', error);
      return null;
    }
  }
  
  /**
   * Create a new food entity
   */
  _createFood(x, y) {
    if (!this._isWorldInitialized) {
      console.warn('Cannot create food: World not initialized');
      return null;
    }
    
    try {
      // Create entity
      const entity = this.world.createEntity();
      
      // Position component
      const posX = x !== undefined ? x : Math.random() * this.width;
      const posY = y !== undefined ? y : Math.random() * this.height;
      entity.addComponent(new PositionComponent(posX, posY));
      
      // Food component
      entity.addComponent(new FoodComponent(this.parameters.foodEnergy));
      
      return entity;
    } catch (error) {
      console.error('Error creating food:', error);
      return null;
    }
  }
  
  /**
   * Add random food entities
   */
  _addRandomFood(count) {
    for (let i = 0; i < count; i++) {
      this._createFood();
    }
  }
  
  /**
   * Update the number of organisms
   */
  _updateOrganismCount(count) {
    // Get current organisms
    const entities = Array.from(this.world.entities.values());
    const organisms = entities.filter(e => !e.hasComponent('FoodComponent'));
    
    // If we need more organisms
    while (organisms.length < count) {
      this._createOrganism();
      organisms.push({}); // Just to track count
    }
    
    // If we need fewer organisms
    while (organisms.length > count && organisms.length > 0) {
      // Remove the last organism
      const entity = organisms.pop();
      this.world.removeEntity(entity.id);
    }
  }
  
  /**
   * Update the size of all organisms
   */
  _updateEntitySize(size) {
    // Get organisms
    const entities = this.world.getEntitiesWithComponent('AppearanceComponent');
    
    // Update size
    for (const entity of entities) {
      if (!entity.hasComponent('FoodComponent')) {
        const appearance = entity.getComponent('AppearanceComponent');
        appearance.size = size;
      }
    }
  }
  
  /**
   * Draw debug information on the canvas
   */
  _drawDebugInfo() {
    if (!this.context) return;
    
    const ctx = this.context;
    const stats = this.getStatistics();
    
    // Save context
    ctx.save();
    
    // Set text properties
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'left';
    
    // Draw debug info
    ctx.fillText(`Generation: ${stats.generation}`, 10, 20);
    ctx.fillText(`Organisms: ${stats.organismCount}`, 10, 40);
    ctx.fillText(`Food: ${stats.foodCount}`, 10, 60);
    ctx.fillText(`Avg Speed: ${stats.averageSpeed.toFixed(2)}`, 10, 80);
    
    // Draw FPS
    const now = performance.now();
    const fps = Math.round(1000 / (now - (this._lastFrameTime || now)));
    this._lastFrameTime = now;
    ctx.fillText(`FPS: ${fps}`, 10, 100);
    
    // Restore context
    ctx.restore();
  }
  
  /**
   * Get the last error that occurred
   */
  getLastError() {
    return this._lastError;
  }
}

export default RobustSimulationTemplate;