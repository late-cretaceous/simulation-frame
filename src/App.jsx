import { useState, useRef } from 'react'
import './App.css'
import SimulationManager from './components/SimulationManager'
import SimpleSimulation from './simulations/SimpleSimulation'

function App() {
  const [simulationAdapter] = useState(() => new SimpleSimulation());

  return (
    <div className="App">
      <SimulationManager 
        simulationAdapter={simulationAdapter}
        title="Simple Evolution Simulation"
        helpContent={
          <>
            <h3>Evolution Simulation</h3>
            <p>This is a basic simulation with organisms moving around in a virtual environment.</p>
            <p>Controls:</p>
            <ul>
              <li>Drag to pan the view</li>
              <li>Scroll to zoom in/out</li>
              <li>Click on an organism to view its details</li>
            </ul>
            <p>Adjust parameters below to control the simulation behavior.</p>
          </>
        }
        initialParameters={{
          organismCount: 20,
          foodAmount: 50,
          speed: 1.0,
          entitySize: 5
        }}
      />
    </div>
  )
}

export default App