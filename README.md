# Simulation Frame

A React-based framework for building interactive entity-component-system simulations with enhanced error handling and self-healing capabilities.

## 🚀 Key Features

- **Complete ECS Architecture**: Build complex simulations using the Entity-Component-System pattern
- **React Integration**: Seamlessly works with React for UI components
- **Built-in Canvas Management**: Handle viewport, zooming, and interactions
- **Enhanced Robustness**: Self-healing components and automatic error recovery
- **Visual Debugging**: Built-in performance monitoring and debug visualization

## 📦 Installation

```bash
# Install from npm
npm install simulation-frame

# Or with yarn
yarn add simulation-frame
```

## 🏃‍♂️ Quick Start

The fastest way to get started is using the included `RobustSimulationTemplate`:

```jsx
import React from 'react';
import { 
  SimulationManager, 
  RobustSimulationTemplate 
} from 'simulation-frame';
import 'simulation-frame/style.css';

// Create a fully robust simulation instance - works out of the box!
const simulation = new RobustSimulationTemplate();

function App() {
  return (
    <SimulationManager 
      title="My Robust Simulation"
      simulationAdapter={simulation}
      helpContent={<div>This is my awesome simulation!</div>}
    />
  );
}

export default App;
```

This gives you a complete working simulation with:
- Moving organisms with physics
- Interactive canvas with zoom/pan
- Minimap and statistics
- Parameter controls
- Automatic error recovery

## 🏗️ Framework Architecture

Simulation Frame uses the Entity-Component-System (ECS) architectural pattern with a focus on robustness and ease of use:

### Standard Components

1. **`BaseEntity`**: Container for components with unique IDs
2. **`BaseComponent`**: Data structures with no behavior
3. **`BaseSystem`**: Logic that processes entities with specific components
4. **`BaseWorld`**: Central manager for entities and systems

### Enhanced Robust Components (New!)

1. **`EnhancedBaseWorld`**: Self-checking world with transaction support and circuit breakers
2. **`ImprovedBaseComponent`**: Self-healing components with automatic initialization
3. **`ImprovedCanvasRenderer`**: Complete drawing primitives with automatic error recovery
4. **`SimulationDebugger`**: Visual debugging tools and performance monitoring
5. **`RobustSimulationTemplate`**: Ready-to-use implementation with comprehensive error handling

## 🛠️ Creating a Custom Simulation

### Option 1: Extend the Robust Template (Recommended)

```jsx
import { RobustSimulationTemplate } from 'simulation-frame';

class MySimulation extends RobustSimulationTemplate {
  constructor() {
    super();
    // Customize default parameters
    this.parameters = {
      ...this.parameters,
      entityCount: 100,  // Increase default count
    };
  }
  
  // Override only the methods you need to customize
  // All required methods already have robust implementations
}
```

### Option 2: Build Your Own Using Enhanced Components

```jsx
import { 
  EnhancedBaseWorld,
  ImprovedBaseComponent, 
  SimulationAdapter 
} from 'simulation-frame';

// Custom component with error recovery
class HealthComponent extends ImprovedBaseComponent {
  constructor(health = 100) {
    super({
      health,
      maxHealth: health
    });
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0;
  }
}

// Custom simulation with robust error handling
class MySimulation extends SimulationAdapter {
  constructor() {
    super();
    this.world = new EnhancedBaseWorld({
      autoInitialize: true,
      safeMode: true
    });
    // ...rest of your implementation
  }
}
```

## 🔄 Core Concepts

### The Entity-Component-System Pattern

- **Entities**: Simple containers with unique IDs
- **Components**: Pure data attached to entities
- **Systems**: Logic that processes entities with specific components

This pattern provides:
- **Composition over inheritance**: Build complex entities by combining simple components
- **Separation of concerns**: Data (components) is separate from logic (systems)
- **Efficient queries**: Systems only process entities with relevant components

### Entity Operations

```javascript
// Create an entity
const entity = world.createEntity();

// Add components
entity.addComponent(new PositionComponent(10, 20));
entity.addComponent(new VelocityComponent(5, 0));

// Query components
if (entity.hasComponent('PositionComponent')) {
  const position = entity.getComponent('PositionComponent');
  position.x += 10;
}

// Remove components
entity.removeComponent('TemporaryComponent');
```

### System Implementation

```javascript
class MovementSystem {
  constructor(world) {
    this.world = world;
  }
  
  update(deltaTime) {
    // Get all entities with both position and velocity
    const entities = this.world.getEntitiesWithComponent('PositionComponent');
    
    for (const entity of entities) {
      if (entity.hasComponent('VelocityComponent')) {
        const position = entity.getComponent('PositionComponent');
        const velocity = entity.getComponent('VelocityComponent');
        
        // Update position based on velocity
        position.x += velocity.vx * deltaTime;
        position.y += velocity.vy * deltaTime;
      }
    }
  }
}
```

## 🛡️ Error Handling & Robustness

The enhanced components provide multiple layers of protection:

1. **Self-checking initialization**: Components automatically initialize when needed
2. **Method-level recovery**: Each method handles errors internally
3. **Circuit breakers**: Prevent cascading failures from repeated errors
4. **Transaction support**: All-or-nothing batch operations for entity management
5. **Fallback mechanisms**: Alternative implementations when primary methods fail

Example of robust error handling:

```javascript
// Using transactions for safe batch operations
world.beginTransaction();
try {
  // Create multiple entities at once
  for (let i = 0; i < 100; i++) {
    const entity = world.createEntity();
    entity.addComponent(new PositionComponent(x, y));
  }
  // All operations succeed or none do
  world.commitTransaction();
} catch (error) {
  // Automatically rolls back on error
  console.error("Failed batch operation:", error);
}
```

For complete details on the robust features, see the [Framework Guide](./framework-guide.md).

## 🔍 Troubleshooting

### Common Issues

1. **Entities not appearing**
   - Check that your viewport is correctly initialized
   - Ensure entities have the required components
   - Verify your world is properly initialized with `world.isInitialized`

2. **Performance issues**
   - Enable culling with `renderer.setCulling(true)`
   - Use transactions for batch entity operations
   - Check performance with `SimulationDebugger.generatePerformanceReport()`

3. **Component errors**
   - Switch to `ImprovedBaseComponent` for automatic error recovery
   - Check component validity with `component.isValid()`
   - Review error logs with `component.getLastError()`

4. **Canvas rendering problems**
   - Use `ImprovedCanvasRenderer` instead of direct canvas operations
   - Ensure proper viewport transformation
   - Always use `beginFrame()` and `endFrame()` methods

## 📚 Examples

For complete examples, see the [examples directory](https://github.com/yourusername/simulation-frame/tree/main/examples) in the repository.

- `SimpleSimulation`: Basic entity movement with food
- `PredatorPrey`: Classic predator-prey ecosystem
- `Evolution`: Genetic algorithm with natural selection
- `RobustExample`: Demonstration of error handling and recovery

## 📖 Advanced Documentation

For in-depth documentation on the robust features, error handling, and advanced techniques, see the [Framework Guide](./framework-guide.md).

## 📄 License

MIT