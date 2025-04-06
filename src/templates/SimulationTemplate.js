/**
 * SimulationTemplate.js
 * 
 * Complete template for implementing a custom simulation with simulation-frame
 * 
 * ------------------------------------------------
 * SIMULATION ARCHITECTURE OVERVIEW:
 * ------------------------------------------------
 * This framework uses an Entity-Component-System (ECS) architecture:
 * - ENTITIES: Game objects (e.g., organisms, food)
 * - COMPONENTS: Data containers attached to entities (e.g., position, velocity)
 * - SYSTEMS: Logic that processes entities with specific components
 * 
 * The SimulationAdapter class connects your simulation to the UI framework.
 */

import SimulationAdapter from '../core/SimulationAdapter';
import BaseWorld from '../core/BaseWorld';
import BaseEntity from '../core/BaseEntity';
import BaseComponent from '../core/BaseComponent';

/**
 * @class SimulationTemplate
 * @extends SimulationAdapter
 * @description Template class for creating custom simulations
 */
export class SimulationTemplate extends SimulationAdapter {
  /**
   * Create a new simulation instance
   */
  constructor() {
    super();
    
    // --- SIMULATION STATE ---
    this.world = new BaseWorld(); // Entity container
    this.context = null;          // Canvas context
    this.width = 800;             // Simulation width
    this.height = 600;            // Simulation height
    this.isPaused = false;        // Pause state
    this.generation = 0;          // Generation counter (or other primary metric)
    
    // --- SIMULATION PARAMETERS ---
    // These will appear in the UI control panel
    this.parameters = {
      // EXAMPLE: Parameter definition with default values
      speed: 1.0,                 // Simulation speed multiplier
      entityCount: 50,            // Number of entities
      entitySize: 5,              // Size of entities
      mutationRate: 0.05,         // Mutation rate for evolution
      // Add your parameters here
    };
    
    // --- SIMULATION SYSTEMS ---
    // You should initialize your systems in the initialize() method
    this.systems = {
      // Will be populated in initialize()
    };
  }
  
  /**
   * Initialize the simulation with canvas context
   * This is called once when the simulation is first created
   * 
   * @param {CanvasRenderingContext2D} canvasContext - Canvas rendering context
   * @param {number} width - Canvas width in pixels
   * @param {number} height - Canvas height in pixels
   */
  initialize(canvasContext, width, height) {
    this.context = canvasContext;
    this.width = width;
    this.height = height;
    
    // EXAMPLE: Initialize systems
    // this.systems.physics = new PhysicsSystem(this.world, this.width, this.height);
    // this.systems.reproduction = new ReproductionSystem(this.world, this.parameters.mutationRate);
    // this.systems.rendering = new RenderingSystem(this.world, this.context);
    
    // Add systems to world
    // for (const system of Object.values(this.systems)) {
    //   this.world.addSystem(system);
    // }
    
    // Create initial entities
    this.reset();
  }
  
  /**
   * Update simulation state - called every animation frame
   * Delta time allows for consistent simulation speed regardless of frame rate
   * 
   * @param {number} deltaTime - Time elapsed since last update in seconds
   */
  update(deltaTime) {
    if (this.isPaused) return;
    
    // EXAMPLE: Apply speed parameter to deltaTime
    const adjustedDelta = deltaTime * this.parameters.speed;
    
    // EXAMPLE: Update world (this will update all systems)
    // this.world.update(adjustedDelta);
    
    // EXAMPLE: Update generation counter periodically
    // if (Math.random() < 0.01 * adjustedDelta) {
    //   this.generation++;
    // }
    
    // TODO: Implement your simulation update logic
  }
  
  /**
   * Get entity positions for the minimap
   * The minimap shows a bird's-eye view of simulation entities
   * 
   * @returns {Object} - Object with arrays of entity positions
   */
  getEntitiesForMinimap() {
    // EXAMPLE: Return positions of all entities with a position component
    // const organisms = [];
    // const food = [];
    // 
    // const entities = this.world.getEntitiesWithComponent('PositionComponent');
    // 
    // for (const entity of entities) {
    //   const position = entity.components.get('PositionComponent');
    //   
    //   if (entity.components.has('FoodComponent')) {
    //     food.push({ x: position.x, y: position.y });
    //   } else {
    //     organisms.push({ x: position.x, y: position.y });
    //   }
    // }
    
    // TODO: Return positions from your simulation
    return {
      organisms: [],  // Array of { x, y } objects
      food: []        // Array of { x, y } objects
    };
  }
  
  /**
   * Select an entity at the given screen coordinates
   * This is called when the user clicks on the canvas
   * 
   * @param {number} x - X coordinate in screen space
   * @param {number} y - Y coordinate in screen space
   * @param {Object} viewportInfo - Viewport information { offset: {x, y}, scale: number }
   * @returns {Object|null} - Selected entity data or null if none selected
   */
  selectEntityAt(x, y, viewportInfo) {
    // EXAMPLE: Convert screen coordinates to world coordinates
    // const { offset, scale } = viewportInfo;
    // const worldX = (x - offset.x) / scale;
    // const worldY = (y - offset.y) / scale;
    // 
    // // Find nearest entity within selection distance
    // const entities = this.world.getEntitiesWithComponent('PositionComponent');
    // let closestEntity = null;
    // let closestDistance = Infinity;
    // 
    // for (const entity of entities) {
    //   // Skip food entities
    //   if (entity.components.has('FoodComponent')) continue;
    //   
    //   const position = entity.components.get('PositionComponent');
    //   const appearance = entity.components.get('AppearanceComponent');
    //   
    //   if (!position || !appearance) continue;
    //   
    //   // Calculate distance
    //   const dx = position.x - worldX;
    //   const dy = position.y - worldY;
    //   const distance = Math.sqrt(dx * dx + dy * dy);
    //   
    //   // Check if within entity bounds and closer than current closest
    //   if (distance <= appearance.size && distance < closestDistance) {
    //     closestEntity = entity;
    //     closestDistance = distance;
    //   }
    // }
    // 
    // // Return simplified entity data for the UI
    // if (closestEntity) {
    //   const position = closestEntity.components.get('PositionComponent');
    //   const appearance = closestEntity.components.get('AppearanceComponent');
    //   const genetics = closestEntity.components.get('GeneticsComponent');
    //   
    //   return {
    //     id: closestEntity.id,
    //     x: position.x,
    //     y: position.y,
    //     size: appearance.size,
    //     color: appearance.color,
    //     genes: genetics ? genetics.genes : null,
    //     // Add other relevant properties
    //   };
    // }
    
    // TODO: Return entity at the given position in your simulation
    return null;
  }
  
  /**
   * Get statistics about the current simulation state
   * These are displayed in the stats panel
   * 
   * @returns {Object} - Statistics object with key-value pairs
   */
  getStatistics() {
    // EXAMPLE: Calculate simulation statistics
    // const entities = this.world.getEntitiesWithComponent('PositionComponent');
    // const organisms = entities.filter(e => !e.components.has('FoodComponent'));
    // const food = entities.filter(e => e.components.has('FoodComponent'));
    // 
    // // Calculate average fitness
    // let totalFitness = 0;
    // for (const entity of organisms) {
    //   const fitnessComponent = entity.components.get('FitnessComponent');
    //   if (fitnessComponent) {
    //     totalFitness += fitnessComponent.value;
    //   }
    // }
    // const averageFitness = organisms.length > 0 ? totalFitness / organisms.length : 0;
    
    // TODO: Return statistics from your simulation
    return {
      generation: this.generation,
      // organismCount: organisms.length,
      // foodCount: food.length,
      // averageFitness: averageFitness.toFixed(2),
      // Add your statistics here
    };
  }
  
  /**
   * Get metadata for parameters (for UI controls)
   * This defines how parameters appear in the control panel
   * 
   * @returns {Object} - Parameter metadata object
   */
  getParameterMetadata() {
    // EXAMPLE: Parameter metadata defining UI controls
    return {
      speed: {
        type: 'number',              // Type: 'number', 'boolean', or 'string'
        label: 'Simulation Speed',   // Display label
        min: 0.1,                    // Minimum value (for number)
        max: 5.0,                    // Maximum value (for number)
        step: 0.1,                   // Step size (for number)
        description: 'Controls how fast the simulation runs' // Tooltip
      },
      entityCount: {
        type: 'number',
        label: 'Entity Count',
        min: 1,
        max: 200,
        step: 1,
        description: 'Number of entities in the simulation'
      },
      entitySize: {
        type: 'number',
        label: 'Entity Size',
        min: 1,
        max: 20,
        step: 1,
        description: 'Visual size of entities'
      },
      mutationRate: {
        type: 'number',
        label: 'Mutation Rate',
        min: 0,
        max: 1,
        step: 0.01,
        description: 'Probability of mutation during reproduction'
      },
      // TODO: Add metadata for your parameters here
    };
  }
  
  /**
   * Set a parameter value
   * Called when user adjusts a parameter in the UI
   * 
   * @param {string} key - Parameter key
   * @param {any} value - Parameter value
   */
  setParameter(key, value) {
    if (key in this.parameters) {
      this.parameters[key] = value;
      
      // EXAMPLE: Handle parameter change
      // switch (key) {
      //   case 'entityCount':
      //     this.updateEntityCount(value);
      //     break;
      //   case 'entitySize':
      //     this.updateEntitySize(value);
      //     break;
      //   case 'mutationRate':
      //     if (this.systems.reproduction) {
      //       this.systems.reproduction.mutationRate = value;
      //     }
      //     break;
      // }
      
      // TODO: Handle the parameter change in your simulation
    }
  }
  
  /**
   * Pause the simulation
   * Called when the user clicks the pause button
   */
  pause() {
    this.isPaused = true;
  }
  
  /**
   * Resume the simulation
   * Called when the user clicks the resume button
   */
  resume() {
    this.isPaused = false;
  }
  
  /**
   * Reset the simulation to its initial state
   * Called when the user clicks the restart button
   */
  reset() {
    // Clear the world
    this.world.clear();
    this.generation = 0;
    
    // EXAMPLE: Create initial entities
    // for (let i = 0; i < this.parameters.entityCount; i++) {
    //   this.createOrganism();
    // }
    // 
    // // Create food
    // for (let i = 0; i < this.parameters.foodAmount; i++) {
    //   this.createFood();
    // }
    
    // TODO: Reset your simulation state
  }
  
  /**
   * Save the current simulation state
   * Called automatically for autosave and when pausing
   * 
   * @returns {Object} - Serializable state object
   */
  saveState() {
    // EXAMPLE: Create a serializable state object
    // const entityData = [];
    // 
    // // Save important entities (not food)
    // const organisms = Array.from(this.world.entities.values())
    //   .filter(e => !e.components.has('FoodComponent'));
    // 
    // for (const entity of organisms) {
    //   const position = entity.components.get('PositionComponent');
    //   const genetics = entity.components.get('GeneticsComponent');
    //   
    //   entityData.push({
    //     position: { x: position.x, y: position.y },
    //     genetics: { genes: genetics.genes },
    //     // Other components...
    //   });
    // }
    
    // TODO: Return serializable state from your simulation
    return {
      generation: this.generation,
      parameters: { ...this.parameters },
      // entityData: entityData,
    };
  }
  
  /**
   * Load a saved simulation state
   * Called automatically if autosave exists
   * 
   * @param {Object} state - Saved state object
   * @returns {boolean} - Success status
   */
  loadState(state) {
    if (!state) return false;
    
    // EXAMPLE: Load state into simulation
    // Load generation
    // if (state.generation !== undefined) {
    //   this.generation = state.generation;
    // }
    // 
    // // Load parameters
    // if (state.parameters) {
    //   // Merge saved parameters with defaults
    //   this.parameters = { ...this.parameters, ...state.parameters };
    // }
    // 
    // // Clear world
    // this.world.clear();
    // 
    // // Recreate entities
    // if (state.entityData) {
    //   for (const entityData of state.entityData) {
    //     const entity = this.createOrganism(
    //       entityData.position.x,
    //       entityData.position.y,
    //       entityData.genetics.genes
    //     );
    //   }
    // }
    
    // TODO: Load state into your simulation
    
    return true; // Return true if load was successful
  }
  
  /**
   * Save an entity to the library
   * Called when user saves an entity to the library
   * 
   * @param {Object} entity - Entity data
   * @param {string} name - Entity name
   * @param {string} notes - Entity notes
   * @returns {Object|null} - Saved entity or null if failed
   */
  saveEntityToLibrary(entity, name, notes) {
    if (!entity) return null;
    
    // EXAMPLE: Create a copy with additional metadata
    // const savedEntity = {
    //   ...entity,
    //   name,
    //   notes,
    //   savedAt: Date.now()
    // };
    // 
    // // Get existing saved entities
    // let savedEntities = [];
    // try {
    //   const saved = localStorage.getItem('saved-organisms');
    //   if (saved) {
    //     savedEntities = JSON.parse(saved);
    //   }
    // } catch (error) {
    //   console.error('Failed to load saved organisms:', error);
    // }
    // 
    // // Add new entity
    // savedEntities.push(savedEntity);
    // 
    // // Save to localStorage
    // try {
    //   localStorage.setItem('saved-organisms', JSON.stringify(savedEntities));
    // } catch (error) {
    //   console.error('Failed to save organism:', error);
    //   return null;
    // }
    
    // TODO: Save entity to library in your simulation
    return null;
  }
  
  /**
   * Load entities from the library
   * Called when user opens the organism library
   * 
   * @returns {Array} - Array of saved entities
   */
  loadEntitiesFromLibrary() {
    // EXAMPLE: Load saved entities from localStorage
    // try {
    //   const saved = localStorage.getItem('saved-organisms');
    //   if (saved) {
    //     return JSON.parse(saved);
    //   }
    // } catch (error) {
    //   console.error('Failed to load saved organisms:', error);
    // }
    
    // TODO: Load entities from library in your simulation
    return [];
  }
  
  /*
   * HELPER METHODS
   * These are internal methods not required by the framework
   * but useful for implementing the above methods
   */
  
  /**
   * Create an organism entity
   * 
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Array} genes - Genetic data (optional)
   * @returns {Object} - The created entity
   */
  /*
  createOrganism(x, y, genes) {
    // Create entity
    const entity = this.world.createEntity();
    
    // Add position component
    const position = new PositionComponent(
      x || Math.random() * this.width,
      y || Math.random() * this.height
    );
    entity.components.set(position.constructor.name, position);
    position.entity = entity;
    
    // Add velocity component
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 30;
    const velocity = new VelocityComponent(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    entity.components.set(velocity.constructor.name, velocity);
    velocity.entity = entity;
    
    // Add appearance component
    const hue = Math.random() * 360;
    const color = `hsl(${hue}, 80%, 50%)`;
    const appearance = new AppearanceComponent(color, this.parameters.entitySize);
    entity.components.set(appearance.constructor.name, appearance);
    appearance.entity = entity;
    
    // Add genetics component
    const genetics = new GeneticsComponent(genes);
    entity.components.set(genetics.constructor.name, genetics);
    genetics.entity = entity;
    
    return entity;
  }
  */
  
  /**
   * Create a food entity
   * 
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object} - The created entity
   */
  /*
  createFood(x, y) {
    // Create entity
    const entity = this.world.createEntity();
    
    // Add position component
    const position = new PositionComponent(
      x || Math.random() * this.width,
      y || Math.random() * this.height
    );
    entity.components.set(position.constructor.name, position);
    position.entity = entity;
    
    // Add food component
    const food = new FoodComponent();
    entity.components.set(food.constructor.name, food);
    food.entity = entity;
    
    return entity;
  }
  */
  
  /**
   * Update the number of organisms
   * 
   * @param {number} count - Target count
   */
  /*
  updateEntityCount(count) {
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
  */
  
  /**
   * Update the size of all organisms
   * 
   * @param {number} size - New size
   */
  /*
  updateEntitySize(size) {
    const entities = this.world.getEntitiesWithComponent('AppearanceComponent');
    
    for (const entity of entities) {
      if (!entity.components.has('FoodComponent')) {
        const appearance = entity.components.get('AppearanceComponent');
        appearance.size = size;
      }
    }
  }
  */
}

// Some commented-out example component classes to help users implement their own

/*
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

// Genetics component
class GeneticsComponent extends BaseComponent {
  constructor(genes = null) {
    super();
    this.genes = genes || this.generateRandomGenes();
  }
  
  generateRandomGenes() {
    // Example: 10 random genes between 0 and 1
    return Array.from({ length: 10 }, () => Math.random());
  }
  
  mutate(mutationRate) {
    return this.genes.map(gene => 
      Math.random() < mutationRate ? 
        Math.max(0, Math.min(1, gene + (Math.random() - 0.5) * 0.2)) : 
        gene
    );
  }
}

// Food component - acts as a tag
class FoodComponent extends BaseComponent {
  constructor(energy = 50) {
    super();
    this.energy = energy;
  }
}

// Example system for handling physics
class PhysicsSystem {
  constructor(world, worldWidth, worldHeight) {
    this.world = world;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
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
*/

export default SimulationTemplate;