# Simulation Framework Implementation Guide

This guide explains how to use the improved simulation framework with built-in error handling, automatic recovery, and foolproof initialization.

## Key Improvements

The framework has been enhanced with several important features:

1. **Self-checking initialization** - Components initialize automatically when needed
2. **Error recovery** - Built-in fallbacks and circuit breakers to prevent cascading failures
3. **Comprehensive drawing capabilities** - Complete set of drawing primitives with safety checks
4. **Debug tools** - Visual debugging and performance monitoring
5. **Working examples** - Ready-to-use implementations that require minimal configuration

## Quick Start

The fastest way to get started is using the `RobustSimulationTemplate`:

```javascript
import { RobustSimulationTemplate } from './path/to/RobustSimulationTemplate';
import { SimulationManager } from 'simulation-frame';

// Create a simulation instance - works out of the box!
const simulation = new RobustSimulationTemplate();

// Render it with SimulationManager
function App() {
  return (
    <SimulationManager 
      simulationAdapter={simulation}
      title="My Simulation"
      helpContent={<div>This is my simulation!</div>}
    />
  );
}

export default App;
```

That's it! This will give you a fully functioning simulation with:
- Moving organisms
- Basic physics
- Minimap
- Statistics panel
- Parameter controls

## Understanding the Core Architecture

The framework uses these enhanced components:

### 1. RobustSimulationTemplate

A complete, ready-to-use simulation that works with zero customization.

Key features:
- Self-initializing
- Error handling for all operations
- Pre-implemented systems for physics and rendering
- Complete implementation of all required methods

### 2. EnhancedBaseWorld

The central entity manager with safety features:

```javascript
// Create a world that auto-initializes
const world = new EnhancedBaseWorld({
  autoInitialize: true,
  safeMode: true,
  debugMode: false
});

// Create an entity (safely handles errors)
const entity = world.createEntity();

// Add components safely (recovers from errors)
entity.addComponent(new PositionComponent(10, 20));

// Transaction support for batch operations
world.beginTransaction();
for (let i = 0; i < 100; i++) {
  world.createEntity();
}
world.commitTransaction();
```

### 3. ImprovedBaseComponent

Enhanced component base class with self-healing:

```javascript
// Create a custom component
class HealthComponent extends ImprovedBaseComponent {
  constructor(health = 100) {
    // Initialize with properties
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

// Components automatically initialize and track errors
const health = new HealthComponent(100);
```

### 4. ImprovedCanvasRenderer

Comprehensive drawing with error handling:

```javascript
// Create a renderer with error recovery
const renderer = new ImprovedCanvasRenderer(canvas, context, {
  highDPI: true,
  errorRecovery: true,
  culling: true
});

// Start rendering a frame
renderer.beginFrame();

// All drawing methods handle errors automatically
renderer.drawCircle(x, y, radius, 'red');
renderer.drawLine(x1, y1, x2, y2, 'blue', 2);
renderer.drawPolygon(points, 'green', 'black', 1);
renderer.drawText("Hello World", x, y, 'white');

// End the frame
renderer.endFrame();

// Get performance stats
const stats = renderer.getPerformanceStats();
console.log(`FPS: ${stats.fps.toFixed(1)}`);
```

### 5. SimulationDebugger

Visual debugging tools:

```javascript
// Create a debugger for your simulation
const debugger = new SimulationDebugger(simulation, {
  enabled: true,
  visualDebugging: true,
  performanceMonitoring: true
});

// Check the health of your simulation
const health = debugger.checkHealth();
if (!health.healthy) {
  console.warn("Simulation issues:", health.issues);
}

// Generate a comprehensive performance report
const report = debugger.generatePerformanceReport();
```

## Common Patterns

### Safe Entity Creation

```javascript
// Using a transaction guarantees all-or-nothing entity creation
world.beginTransaction();

try {
  // Create entity
  const entity = world.createEntity();
  
  // Add components
  entity.addComponent(new PositionComponent(x, y));
  entity.addComponent(new VelocityComponent(vx, vy));
  entity.addComponent(new AppearanceComponent(color, size));
  
  // Commit changes
  world.commitTransaction();
  return entity;
} catch (error) {
  // Automatically rolls back on error
  world.rollbackTransaction();
  console.error("Failed to create entity:", error);
  return null;
}
```

### Robust Rendering

```javascript
function render() {
  // Begin frame with auto-clearing
  renderer.beginFrame();
  
  try {
    // Draw background
    renderer.drawRect(0, 0, width, height, 'black');
    
    // Draw entities
    for (const entity of entities) {
      const position = entity.getComponent('PositionComponent');
      const appearance = entity.getComponent('AppearanceComponent');
      
      // Will skip if off-screen and handle errors automatically
      renderer.drawCircle(
        position.x, 
        position.y, 
        appearance.size,
        appearance.color
      );
    }
  } catch (error) {
    console.error("Render error:", error);
    // Framework will recover automatically
  }
  
  // Always end the frame
  renderer.endFrame();
}
```

### Error Recovery

The framework provides multiple levels of error handling:

1. **Method-level recovery** - Each method catches and handles errors
2. **Circuit breakers** - Prevent cascading failures
3. **Transaction rollback** - Safe batch operations
4. **Fallback mechanisms** - Alternative implementations when primary fails

Example:

```javascript
// This will never throw an error to your code - it recovers internally
try {
  // Even if this fails, it won't crash your app
  const result = world.update(deltaTime);
  
  // Check the success status
  if (!result) {
    console.warn("Update had issues but recovered");
  }
} catch (error) {
  // You'll never reach this point - errors are handled internally
  console.error("This won't happen!");
}

// Check for errors if you want to know what happened
const errors = world.getErrors();
if (errors.length > 0) {
  console.log("Errors occurred:", errors);
}
```

## Best Practices

1. **Use Transactions** - For batch entity operations

   ```javascript
   world.beginTransaction();
   // Create/modify multiple entities
   world.commitTransaction();
   ```

2. **Frame-based Rendering** - Always use beginFrame/endFrame

   ```javascript
   renderer.beginFrame();
   // Drawing operations
   renderer.endFrame();
   ```

3. **Check Results** - Methods return success values

   ```javascript
   const success = world.update(deltaTime);
   if (!success) {
    // Something went wrong but was handled
   }
   ```

4. **Visual Debugging** - Enable debug mode during development

   ```javascript
   renderer.setDebugMode(true);
   world.setDebugMode(true);
   ```

5. **Use Enhanced Base Classes** - Always extend from improved base classes

   ```javascript
   // Use ImprovedBaseComponent instead of BaseComponent
   class MyComponent extends ImprovedBaseComponent {
     // Your code
   }
   ```

## Troubleshooting

### Common Issues and Solutions

#### 1. Entities not appearing

**Solution**: Check visibility and make sure your renderer viewport matches your world:

```javascript
// Sync viewport with simulation
renderer.setViewport(
  simulation.viewportOffset,
  simulation.viewportScale
);
```

#### 2. Slow performance

**Solution**: Enable culling and check performance stats:

```javascript
// Enable culling to skip off-screen drawing
renderer.setCulling(true);

// Check for bottlenecks
const stats = renderer.getPerformanceStats();
console.log(`Objects drawn: ${stats.objectsDrawn}`);
console.log(`Skipped: ${stats.skippedDraws}`);
```

#### 3. Drawing errors

**Solution**: Use provided drawing methods with fallbacks:

```javascript
// Instead of direct canvas operations:
// context.arc(x, y, radius, 0, Math.PI * 2); // Can fail!

// Use safe methods:
renderer.drawCircle(x, y, radius, color); // Safe, with fallback
```

#### 4. Component issues

**Solution**: Check component validity and errors:

```javascript
if (!component.isValid()) {
  console.warn("Component is invalid:", component.getLastError());
}
```

#### 5. World corruption

**Solution**: Use the circuit breaker and reset mechanism:

```javascript
// Check world health
if (world.getErrors().length > 10) {
  // Reset to clean state
  world.clear();
  world.clearErrors();
  
  // Recreate core entities
  setupInitialEntities();
}
```

## Advanced Usage

### Custom Systems

Create systems to process specific entity types:

```javascript
class MovementSystem {
  constructor(world) {
    this.world = world;
  }
  
  update(deltaTime) {
    try {
      // Get entities with required components
      const entities = this.world.getEntitiesWithComponent('PositionComponent');
      
      for (const entity of entities) {
        if (entity.hasComponent('VelocityComponent')) {
          const position = entity.getComponent('PositionComponent');
          const velocity = entity.getComponent('VelocityComponent');
          
          // Update position
          position.x += velocity.vx * deltaTime;
          position.y += velocity.vy * deltaTime;
        }
      }
    } catch (error) {
      console.error("Movement system error:", error);
      // The error is handled, system continues next frame
    }
  }
}
```

### Custom Renderers

Extend the improved renderer:

```javascript
class GameRenderer extends ImprovedCanvasRenderer {
  constructor(canvas, context) {
    super(canvas, context, {
      highDPI: true,
      culling: true
    });
    
    // Load assets
    this.assets = {
      sprites: {}
    };
    
    this.loadAssets();
  }
  
  async loadAssets() {
    // Load sprites safely
    try {
      this.assets.sprites.player = await this.loadImage('player.png');
    } catch (error) {
      console.error("Failed to load player sprite:", error);
      // Create placeholder sprite
      this.assets.sprites.player = this.createPlaceholderSprite(32, 32);
    }
  }
  
  // Create a placeholder for missing assets
  createPlaceholderSprite(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Draw placeholder
    ctx.fillStyle = 'magenta';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'black';
    ctx.fillText('?', width/2, height/2);
    
    return canvas;
  }
  
  // Custom rendering method
  renderGame(entities) {
    this.beginFrame();
    
    // Draw all entities
    for (const entity of entities) {
      // Safe drawing with error handling
      this.drawEntity(entity);
    }
    
    this.endFrame();
  }
  
  drawEntity(entity) {
    const position = entity.getComponent('PositionComponent');
    
    if (!position) return;
    
    // Draw based on entity type
    if (entity.hasComponent('PlayerComponent')) {
      this.drawSprite(
        this.assets.sprites.player,
        position.x,
        position.y,
        32,
        32
      );
    } else {
      // Default circle
      this.drawCircle(position.x, position.y, 10, 'blue');
    }
  }
}
```

### Performance Optimization

Use these techniques to improve performance:

```javascript
// 1. Enable culling to skip off-screen entities
renderer.setCulling(true);

// 2. Use transactions for batch operations
world.beginTransaction();
// Add/remove multiple entities
world.commitTransaction();

// 3. Pre-calculate visibility
const visibleEntities = entities.filter(entity => {
  const position = entity.getComponent('PositionComponent');
  return renderer._isVisible(position.x, position.y, 10);
});

// 4. Only draw visible entities
for (const entity of visibleEntities) {
  renderer.drawEntity(entity);
}

// 5. Monitor performance
const stats = renderer.getPerformanceStats();
if (stats.fps < 30) {
  // Reduce detail level
  detailLevel = 'low';
}
```

## Integration with Existing Code

To integrate these improvements with existing simulations:

1. Replace base classes with improved versions:
   - `BaseWorld` → `EnhancedBaseWorld`
   - `BaseComponent` → `ImprovedBaseComponent`
   - `CanvasRenderer` → `ImprovedCanvasRenderer`

2. Add the simulation debugger:
   ```javascript
   const debugger = new SimulationDebugger(yourSimulation);
   ```

3. Use RobustSimulationTemplate as a reference:
   ```javascript
   // See how methods are implemented in RobustSimulationTemplate
   // and apply similar patterns to your code
   ```

4. Wrap error-prone code in try/catch (if not using improved base classes):
   ```javascript
   try {
     // Your existing code
   } catch (error) {
     console.error("Error:", error);
     // Provide fallback behavior
   }
   ```

## Conclusion

By following these guidelines and using the improved components, your simulations will be more robust, easier to debug, and less prone to crashes. The framework now handles many common issues automatically, allowing you to focus on creating interesting simulations rather than debugging infrastructure problems.
