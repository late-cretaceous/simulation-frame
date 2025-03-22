import React, { useState, useEffect, useRef } from 'react';
import SimulationCanvas from './SimulationCanvas';
import SimulationControls from './SimulationControls';
import SimulationStats from './SimulationStats';
import HelpPanel from './HelpPanel';
import OrganismViewer from './OrganismViewer';
import OrganismLibrary from './OrganismLibrary';
import useAnimationLoop from '../hooks/useAnimationLoop';
import useStorage from '../hooks/useStorage';

/**
 * Main component that manages the simulation and UI
 */
const SimulationManager = ({ 
  simulationAdapter,
  title = "Evolution Simulation",
  helpContent = null,
  initialParameters = {},
}) => {
  // Canvas reference
  const canvasRef = useRef(null);
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [statistics, setStatistics] = useState({});
  const [parameters, setParameters] = useState(initialParameters);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);
  const [hasLoadedSavedState, setHasLoadedSavedState] = useState(false);
  const [lastAutosaveTime, setLastAutosaveTime] = useState(null);
  
  // Entity positions for minimap
  const [organismPositions, setOrganismPositions] = useState([]);
  const [foodPositions, setFoodPositions] = useState([]);
  
  // Storage hook
  const { saveState, loadState, hasState } = useStorage('simulation-state');
  
  // Initialize simulation when canvas is ready
  useEffect(() => {
    if (canvasRef.current && !isInitialized) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        simulationAdapter.initialize(ctx, canvasRef.current.width, canvasRef.current.height);
        setParameters(simulationAdapter.getParameters());
        setIsInitialized(true);
        
        // Try to load saved state
        if (hasState()) {
          const savedState = loadState();
          if (savedState && simulationAdapter.loadState(savedState)) {
            setHasLoadedSavedState(true);
            setStatistics(simulationAdapter.getStatistics());
            setParameters(simulationAdapter.getParameters());
            
            // Extract generation from statistics if available
            if (savedState.generation) {
              setGeneration(savedState.generation);
            }
          }
        }
      }
    }
  }, [canvasRef, simulationAdapter, isInitialized, hasState, loadState]);
  
  // Animation loop hook
  useAnimationLoop({
    isActive: isInitialized && isRunning,
    onFrame: (deltaTime) => {
      simulationAdapter.update(deltaTime);
      
      // Update statistics
      const stats = simulationAdapter.getStatistics();
      setStatistics(stats);
      
      // Update generation if it changed
      if (stats.generation !== undefined && stats.generation !== generation) {
        setGeneration(stats.generation);
      }
      
      // Update entity positions for minimap
      const positions = simulationAdapter.getEntitiesForMinimap();
      setOrganismPositions(positions.organisms || []);
      setFoodPositions(positions.food || []);
      
      // Autosave periodically (every 30 seconds)
      const now = new Date();
      if (!lastAutosaveTime || now - lastAutosaveTime > 30000) {
        const state = simulationAdapter.saveState();
        saveState(state);
        setLastAutosaveTime(now);
      }
    }
  });
  
  // Handle running state changes
  useEffect(() => {
    if (isInitialized) {
      if (isRunning) {
        simulationAdapter.resume();
      } else {
        simulationAdapter.pause();
        
        // Save state when pausing
        const state = simulationAdapter.saveState();
        saveState(state);
        setLastAutosaveTime(new Date());
      }
    }
  }, [isRunning, isInitialized, simulationAdapter, saveState]);
  
  // Handle parameter changes
  const handleParameterChange = (key, value) => {
    simulationAdapter.setParameter(key, value);
    setParameters({
      ...parameters,
      [key]: value
    });
  };
  
  // Toggle the simulation on/off
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };
  
  // Request restart confirmation
  const requestRestartSimulation = () => {
    setShowRestartConfirmation(true);
  };
  
  // Confirm restart simulation
  const confirmRestartSimulation = () => {
    setShowRestartConfirmation(false);
    simulationAdapter.reset();
    setGeneration(0);
    setStatistics(simulationAdapter.getStatistics());
    setParameters(simulationAdapter.getParameters());
  };
  
  // Cancel restart simulation
  const cancelRestartSimulation = () => {
    setShowRestartConfirmation(false);
  };
  
  // Handle entity selection
  const handleOrganismSelect = (x, y, viewportOffset, viewportScale) => {
    const entity = simulationAdapter.selectEntityAt(x, y, { offset: viewportOffset, scale: viewportScale });
    setSelectedEntity(entity);
  };
  
  // Handle closing viewer
  const handleCloseViewer = () => {
    setSelectedEntity(null);
  };
  
  // Handle opening organism library
  const handleOpenLibrary = () => {
    setShowLibrary(true);
  };
  
  // Handle closing organism library
  const handleCloseLibrary = () => {
    setShowLibrary(false);
  };
  
  // Handle selecting organism from library for viewing
  const handleSelectFromLibrary = (entityData) => {
    setSelectedEntity(entityData);
    setShowLibrary(false);
  };
  
  // Layout mode (with or without viewer)
  const getLayoutMode = () => {
    if (selectedEntity) {
      return 'with-viewer';
    }
    return 'default';
  };
  
  return (
    <div className="simulator-container">
      <h1 className="simulator-title">{title}</h1>
      
      {hasLoadedSavedState && (
        <div className="autosave-notice">
          Loaded saved simulation from your last session!
        </div>
      )}
      
      <div className={`simulator-layout layout-${getLayoutMode()}`}>
        <div className="simulation-area">
          <div className="canvas-wrapper">
            <SimulationCanvas 
              canvasRef={canvasRef}
              organismPositions={organismPositions}
              foodPositions={foodPositions}
              onOrganismSelect={handleOrganismSelect}
              selectionEnabled={true}
            />
            <div className="canvas-instructions">
              <p>Drag to pan, scroll to zoom. Click on an organism to select it.</p>
            </div>
          </div>
          
          <SimulationStats 
            generation={generation}
            stats={statistics}
            isRunning={isRunning}
            onToggleSimulation={toggleSimulation}
            onRestartSimulation={requestRestartSimulation}
            showRestartConfirmation={showRestartConfirmation}
            onConfirmRestart={confirmRestartSimulation}
            onCancelRestart={cancelRestartSimulation}
            lastAutosaveTime={lastAutosaveTime}
            {...parameters}
          />
        </div>
        
        <div className="control-panel">
          <HelpPanel content={helpContent} />
          
          <SimulationControls 
            {...parameters}
            setParameters={handleParameterChange}
          />
          
          {/* Organism Viewer */}
          <OrganismViewer 
            organismData={selectedEntity}
            onClose={handleCloseViewer}
            generation={generation}
            onViewLibrary={handleOpenLibrary}
          />
        </div>
      </div>
      
      {/* Organism Library (shown as modal) */}
      {showLibrary && (
        <OrganismLibrary
          onSelectOrganism={handleSelectFromLibrary}
          onClose={handleCloseLibrary}
          getOrganisms={() => simulationAdapter.loadEntitiesFromLibrary()}
          saveOrganism={(entity, name, notes) => 
            simulationAdapter.saveEntityToLibrary(entity, name, notes)
          }
        />
      )}
    </div>
  );
};

export default SimulationManager;