# Simulation Frame

A React-based framework for building interactive entity-component-system simulations.

## Installation

```bash
# Install from npm
npm install simulation-frame

# Or with yarn
yarn add simulation-frame
```

## Quick Start

The fastest way to get started is using the included simulation template:

```jsx
import React from 'react';
import { 
  SimulationManager, 
  SimulationTemplate 
} from 'simulation-frame';
import 'simulation-frame/style.css';

// Extend the template with your custom implementation
class MySimulation extends SimulationTemplate {
  constructor() {
    super();
    // Customize default parameters
    this.parameters = {
      ...this.parameters,
      entityCount: 100,  // Increase default count
    };
  }
  
  // Override methods as needed
  // All required methods already have basic implementations
}

function App() {
  // Create your simulation instance
  const simulation = new MySimulation();
  
  return (
    <SimulationManager 
      title="My Custom Simulation"
      simulationAdapter={simulation}
      helpContent={<div>This is my awesome simulation!</div>}
    />
  );
}

export default App;
```

## Framework Architecture

Simulation Frame uses the Entity-Component-System (ECS) architectural pattern with a focus on robustness and ease of use:

1. **Entities**: Containers for components with unique IDs
2. **Components**: Pure data structures with no behavior
3. **Systems**: Logic that processes entities with specific components

### Key Benefits

- **Composition over inheritance**: Build complex entities by combining simple components
- **Separation of concerns**: Data (components) is separate from logic (systems)
- **Robust error handling**: Defensive programming prevents common errors
- **Lifecycle management**: Proper initialization, update, and cleanup processes

## Using the Simulation Template

The framework includes a comprehensive template (`SimulationTemplate`) with:

1. **Complete Structure**: All required methods pre-implemented
2. **Detailed Documentation**: JSDoc comments explaining each method
3. **Example Code**: Commented example implementations
4. **Helper Methods**: Common utility methods
5. **Error Handling**: Robust error checking and recovery

### Important Implementation Notes

When implementing your own simulations, keep these best practices in mind:

1. **Always check initialization**:
   ```javascript
   if (!this.world) {
     console.error('World not initialized');
     return; // Prevent null reference errors
   }
   ```

2. **Ensure proper world initialization**:
   ```javascript
   // In initialize() method
   this.world = new BaseWorld();
   this.world.initialize(); // Must call this!
   ```

3. **Use defensive programming**:
   ```javascript
   // Before using a method
   if (typeof this.world.getEntitiesWithComponent !== 'function') {
     console.error('BaseWorld instance missing critical method');
     return [];
   }
   ```

4. **Handle errors gracefully**:
   ```javascript
   try {
     // Operation that might fail
   } catch (error) {
     console.error('Operation failed:', error);
     // Return sensible default
   }
   ```

### Creating a New Simulation

1. **Copy the Template**: Start by importing and extending `SimulationTemplate`
   ```jsx
   import { SimulationTemplate } from 'simulation-frame';
   
   class MySimulation extends SimulationTemplate {
     // Your implementation
   }
   ```

2. **Implement Core Methods**: At minimum, implement these methods:
   - `initialize(canvasContext, width, height)`: Set up your simulation
   - `update(deltaTime)`: Update simulation state each frame
   - `reset()`: Create initial entities

3. **Define Custom Components**: Create data containers for your entities
   ```jsx
   class PositionComponent extends BaseComponent {
     constructor(x = 0, y = 0) {
       super();
       this.x = x;
       this.y = y;
     }
   }
   ```

4. **Create Custom Systems**: Implement logic to process entities
   ```jsx
   class MovementSystem {
     constructor(world) {
       this.world = world;
     }
     
     update(deltaTime) {
       // Process entities with movement
     }
   }
   ```

### Template Method Overview

| Method | Purpose |
| ------ | ------- |
| `initialize()` | Set up simulation and systems |
| `update()` | Update simulation state each frame |
| `getEntitiesForMinimap()` | Provide entity positions for minimap |
| `selectEntityAt()` | Handle entity selection on click |
| `getStatistics()` | Return statistics for display |
| `getParameters()` | Get configurable parameters |
| `setParameter()` | Handle parameter changes |
| `pause()` | Pause simulation |
| `resume()` | Resume simulation |
| `reset()` | Reset to initial state |
| `saveState()` | Save simulation state |
| `loadState()` | Load saved state |

## Core Classes

### BaseWorld

The central manager for entities and systems:

```javascript
// Create and initialize a world
const world = new BaseWorld();
world.initialize();

// Create an entity with components
const entity = world.createEntity();
entity.addComponent(new PositionComponent(10, 20));

// Add systems for logic
world.addSystem(new MovementSystem());

// Update the simulation
world.update(deltaTime);
```

### BaseComponent

Base class for all component types:

```javascript
// Create a custom component
class HealthComponent extends BaseComponent {
  constructor(health = 100) {
    super();
    this.health = health;
    this.maxHealth = health;
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0; // Return true if dead
  }
}
```

### SimulationAdapter

Connects your simulation to the UI framework:

```javascript
// Implement required methods
class MySimulation extends SimulationAdapter {
  initialize(context, width, height) {
    super.initialize(context, width, height);
    // Additional initialization
    return true;
  }
  
  // Other methods...
}
```

### CanvasRenderer

Helper for proper canvas rendering with features to prevent trailing artifacts and support high-DPI displays:

```javascript
// Create a renderer with an existing canvas and context
const renderer = new CanvasRenderer(canvas, context);

// In your render system update method
renderer.beginFrame();  // Properly clears canvas
renderer.drawCircle(x, y, radius, color);
renderer.drawRect(x, y, width, height, color);
renderer.endFrame();

// Convert between screen and world coordinates
const worldPos = renderer.screenToWorld(mouseX, mouseY);
```

## Troubleshooting

### Common Issues

1. **Undefined method errors**: Make sure to initialize `BaseWorld` before using its methods
   ```javascript
   this.world = new BaseWorld();
   this.world.initialize(); // Important!
   ```

2. **Components not found**: Check component names match exactly
   ```javascript
   // This uses the constructor name
   entity.addComponent(new PositionComponent());
   
   // Later, use the exact same name
   world.getEntitiesWithComponent('PositionComponent');
   ```

3. **Systems not updating**: Ensure systems have an `update` method
   ```javascript
   class MySystem {
     update(deltaTime) {
       // Must implement this method
     }
   }
   ```

4. **Null reference errors**: Always check objects exist before using them
   ```javascript
   if (!this.world || !this.context) {
     console.error('Required objects not initialized');
     return;
   }
   ```

5. **Entities leaving trails**: Use the CanvasRenderer to properly clear the canvas
   ```javascript
   // Instead of manually clearing:
   renderer.beginFrame(); // Properly clears the entire canvas
   // Draw entities...
   renderer.endFrame();
   ```

## Examples

For complete examples, see the [examples directory](https://github.com/yourusername/simulation-frame/tree/main/examples) in the repository.

- `SimpleSimulation`: Basic entity movement with food
- `PredatorPrey`: Classic predator-prey ecosystem
- `Evolution`: Genetic algorithm with natural selection

## License

MIT