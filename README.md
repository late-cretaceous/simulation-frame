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