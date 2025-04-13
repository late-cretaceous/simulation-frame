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
// ENHANCED COMPONENT CLASSES
// =========================================

// Position component with property validation
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
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}

// Velocity component with property validation
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
  
  // Helper methods
  getVelocity() {
    return { vx: this.vx, vy: this.vy };
  }
  
  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }
  
  // Get speed (magnitude of velocity)
  getSpeed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }
}

// Appearance component with property validation
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

// Food component with property validation
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
    this._errorCounts = {};
    this._maxErrorsBeforeBreaker = 5;
    
    // Create a world instance with safety options
    this.world = new BaseWorld({
      autoInitialize: true,
      safeMode: true,
      debugMode: true
    });
    
    // Register component types for auto-creation
    this.registerComponents();
    
    // Register null component implementations for safety
    this.registerNullComponents();
    
    // Create systems
    this.physicsSystem = new PhysicsSystem(null, 800, 600);
    this.renderingSystem = new RenderingSystem(null, null);
    
    // Basic simulation state
    this.generation = 0;
    this.generationTimer = 0;
    this.isPaused = false;
    
    // Default parameters
    this.parameters = this.getDefaultParameters();
    
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
   * Automatically registers all standard components
   */
  registerComponents() {
    // Register component constructors for auto-creation
    this.world.registerComponents({
      PositionComponent: PositionComponent,
      VelocityComponent: VelocityComponent,
      AppearanceComponent: AppearanceComponent,
      FoodComponent: FoodComponent
    });
  }
  
  /**
   * Register null component implementations for safety
   */
  registerNullComponents() {
    this.world.registerNullComponents({
      // Position component null implementation
      PositionComponent: () => ({
        type: 'PositionComponent',
        enabled: false,
        entity: null,
        isNull: true,
        x: 0,
        y: 0,
        getPosition: () => ({ x: 0, y: 0 }),
        setPosition: () => ({ x: 0, y: 0 }),
        isValid: () => false
      }),
      
      // Velocity component null implementation
      VelocityComponent: () => ({
        type: 'VelocityComponent',
        enabled: false,
        entity: null,
        isNull: true,
        vx: 0,
        vy: 0,
        getVelocity: () => ({ vx: 0, vy: 0 }),
        setVelocity: () => ({ vx: 0, vy: 0 }),
        getSpeed: () => 0,
        isValid: () => false
      }),
      
      // Appearance component null implementation
      AppearanceComponent: () => ({
        type: 'AppearanceComponent',
        enabled: false,
        entity: null,
        isNull: true,
        color: '#cccccc',
        size: 3,
        isValid: () => false
      }),
      
      // Food component null implementation
      FoodComponent: () => ({
        type: 'FoodComponent',
        enabled: false,
        entity: null,
        isNull: true,
        energy: 0,
        type: 'food',
        isValid: () => false
      })
    });
  }
  
  /**
   * Get default parameters
   */
  getDefaultParameters() {
    return {
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
   * Get statistics about the simulation with safe error handling
   */
  getStatistics() {
    // Check if simulation is initialized
    if (!this._isSimulationInitialized) {
      return { generation: this.generation };
    }
    
    // Use safe execution pattern
    return this._safeExecute('getStatistics', () => {
      // Get entities
      const allEntities = Array.from(this.world.entities.values());
      const organisms = allEntities.filter(e => !e.hasComponent('FoodComponent'));
      const food = allEntities.filter(e => e.hasComponent('FoodComponent'));
      
      // Calculate average speed safely
      let totalSpeed = 0;
      let validVelocityCount = 0;
      
      for (const entity of organisms) {
        // Get velocity component safely
        const velocity = entity.getComponentSafe ? 
          entity.getComponentSafe('VelocityComponent') : 
          entity.getComponent('VelocityComponent');
        
        // Check if velocity exists and has valid properties
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
      
      // Return statistics
      return {
        generation: this.generation || 0,
        organismCount: organisms.length,
        foodCount: food.length,
        totalEntities: allEntities.length,
        averageSpeed: averageSpeed,
        validVelocityCount: validVelocityCount,
        worldWidth: this.width || 800,
        worldHeight: this.height || 600
      };
    }, 
    // Fallback if anything fails
    {
      generation: this.generation || 0,
      organismCount: 0,
      foodCount: 0,
      totalEntities: 0,
      averageSpeed: 0,
      worldWidth: this.width || 800,
      worldHeight: this.height || 600
    });
  }
  
  /**
   * Safe execution wrapper with circuit breaker pattern
   * @private
   */
  _safeExecute(methodName, callback, fallback) {
    try {
      return callback();
    } catch (error) {
      // Record error for circuit breaker
      this._errorCounts[methodName] = (this._errorCounts[methodName] || 0) + 1;
      
      // Track error
      this._lastError = {
        method: methodName,
        error: error,
        message: `Error in ${methodName}`,
        time: new Date()
      };
      
      // Log with context
      console.error(`Error in ${methodName}:`, error, 
                   `This is occurrence ${this._errorCounts[methodName]}`);
      
      // Check circuit breaker
      if (this._errorCounts[methodName] > this._maxErrorsBeforeBreaker) {
        console.warn(`Circuit breaker triggered for ${methodName}`);
      }
      
      // Return fallback
      return typeof fallback === 'function' ? fallback() : fallback;
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
   * Save the current simulation state with safe error handling
   */
  saveState() {
    return this._safeExecute('saveState', () => {
      // Create entity data
      const entityData = [];
      
      // Get all entities that are not food
      const entities = Array.from(this.world.entities.values());
      const organisms = entities.filter(e => !e.hasComponent('FoodComponent'));
      
      // Save organism data with safety checks
      for (const entity of organisms) {
        // Get components safely
        const position = entity.getComponentSafe ? 
          entity.getComponentSafe('PositionComponent') : 
          entity.getComponent('PositionComponent');
          
        const velocity = entity.getComponentSafe ? 
          entity.getComponentSafe('VelocityComponent') : 
          entity.getComponent('VelocityComponent');
          
        const appearance = entity.getComponentSafe ? 
          entity.getComponentSafe('AppearanceComponent') : 
          entity.getComponent('AppearanceComponent');
        
        // Only include entity if it has all required components with valid properties
        if (position && velocity && appearance) {
          // Safely access properties with defaults
          const posX = typeof position.x === 'number' ? position.x : 0;
          const posY = typeof position.y === 'number' ? position.y : 0;
          const velX = typeof velocity.vx === 'number' ? velocity.vx : 0;
          const velY = typeof velocity.vy === 'number' ? velocity.vy : 0;
          const color = typeof appearance.color === 'string' ? appearance.color : '#00ff00';
          const size = typeof appearance.size === 'number' ? appearance.size : 5;
          
          entityData.push({
            position: { x: posX, y: posY },
            velocity: { vx: velX, vy: velY },
            appearance: { color: color, size: size }
          });
        }
      }
      
      // Save food positions with safety checks
      const foodData = [];
      const food = entities.filter(e => e.hasComponent('FoodComponent'));
      
      for (const entity of food) {
        // Get position component safely
        const position = entity.getComponentSafe ? 
          entity.getComponentSafe('PositionComponent') : 
          entity.getComponent('PositionComponent');
        
        // Only include if position is valid
        if (position) {
          const posX = typeof position.x === 'number' ? position.x : 0;
          const posY = typeof position.y === 'number' ? position.y : 0;
          
          foodData.push({ x: posX, y: posY });
        }
      }
      
      // Return state object
      return {
        timestamp: Date.now(),
        generation: this.generation || 0,
        generationTimer: this.generationTimer || 0,
        parameters: { ...this.parameters },
        entities: entityData,
        food: foodData
      };
    }, 
    // Fallback state object
    {
      timestamp: Date.now(),
      generation: this.generation || 0,
      generationTimer: this.generationTimer || 0,
      parameters: { ...this.parameters },
      entities: [],
      food: []
    });
  }
  
  /**
   * Load a saved simulation state with safe error handling
   */
  loadState(state) {
    if (!state) return false;
    
    return this._safeExecute('loadState', () => {
      // Ensure world is initialized
      if (!this._isWorldInitialized) {
        this.world.initialize();
        this._isWorldInitialized = true;
      }
      
      // Load generation with validation
      if (state.generation !== undefined && typeof state.generation === 'number') {
        this.generation = state.generation;
      }
      
      // Load generation timer with validation
      if (state.generationTimer !== undefined && typeof state.generationTimer === 'number') {
        this.generationTimer = state.generationTimer;
      }
      
      // Load parameters with validation
      if (state.parameters && typeof state.parameters === 'object') {
        // Safely merge valid parameters
        const validatedParams = { ...this.parameters };
        
        // For each parameter, validate and apply
        Object.entries(state.parameters).forEach(([key, value]) => {
          if (key in this.parameters) {
            // Validate by type
            const currentValue = this.parameters[key];
            
            // Make sure new value matches type of current value
            if (typeof value === typeof currentValue) {
              validatedParams[key] = value;
            }
          }
        });
        
        this.parameters = validatedParams;
      }
      
      // Clear world
      this.world.clear();
      
      // Recreate entities with validation
      if (state.entities && Array.isArray(state.entities)) {
        for (const entityData of state.entities) {
          // Validate required nested objects and properties
          if (entityData && 
              entityData.position && typeof entityData.position === 'object' &&
              entityData.velocity && typeof entityData.velocity === 'object' &&
              entityData.appearance && typeof entityData.appearance === 'object') {
            
            // Extract with validation
            const x = typeof entityData.position.x === 'number' ? entityData.position.x : 0;
            const y = typeof entityData.position.y === 'number' ? entityData.position.y : 0;
            const vx = typeof entityData.velocity.vx === 'number' ? entityData.velocity.vx : 0;
            const vy = typeof entityData.velocity.vy === 'number' ? entityData.velocity.vy : 0;
            const color = typeof entityData.appearance.color === 'string' ? 
              entityData.appearance.color : '#00ff00';
            const size = typeof entityData.appearance.size === 'number' ? 
              entityData.appearance.size : this.parameters.entitySize;
            
            // Create organism with validated data
            this._createOrganism(x, y, vx, vy, color, size);
          }
        }
      }
      
      // Recreate food with validation
      if (state.food && Array.isArray(state.food)) {
        for (const foodData of state.food) {
          if (foodData && typeof foodData === 'object') {
            // Extract with validation
            const x = typeof foodData.x === 'number' ? foodData.x : 0;
            const y = typeof foodData.y === 'number' ? foodData.y : 0;
            
            // Create food with validated data
            this._createFood(x, y);
          }
        }
      }
      
      return true;
    }, false); // Fallback to false if loading fails
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