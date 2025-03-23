# Simulation Frame

A React-based framework for building interactive entity-component-system simulations.

## Installation

```bash
# Install from npm
npm install simulation-frame

# Or with yarn
yarn add simulation-frame
```

## Usage

```jsx
import React from 'react';
import { 
  SimulationManager, 
  SimulationCanvas, 
  BaseWorld,
  BaseEntity 
} from 'simulation-frame';
// Import the CSS
import 'simulation-frame/style.css';

function App() {
  return (
    <SimulationManager 
      title="My Simulation"
      simulationAdapter={mySimulationAdapter}
      helpContent={<div>Help text goes here</div>}
    />
  );
}
```

## Importing Styles

There are multiple ways to import the stylesheet:

```js
// Recommended way
import 'simulation-frame/style.css';

// Alternative ways that also work
import 'simulation-frame/dist/simulation-frame.css';
```

Or you can reference it directly in your HTML:

```html
<link rel="stylesheet" href="node_modules/simulation-frame/dist/simulation-frame.css">
```

## Features

- Entity-Component-System architecture
- Canvas rendering with pan/zoom support
- Customizable simulation controls
- Minimap navigation
- Entity selection and inspection
- Simulation state persistence

## Documentation

[Documentation link coming soon]

## License

MIT