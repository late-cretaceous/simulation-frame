import './App.css';
import './index.css';

// Main components
export { default as SimulationManager } from './components/SimulationManager';
export { default as SimulationCanvas } from './components/SimulationCanvas';
export { default as SimulationControls } from './components/SimulationControls';
export { default as SimulationStats } from './components/SimulationStats';
export { default as HelpPanel } from './components/HelpPanel';
export { default as OrganismViewer } from './components/OrganismViewer';
export { default as OrganismLibrary } from './components/OrganismLibrary';
export { default as MinimapOverlay } from './components/MinimapOverlay';

// Core classes
export { default as SimulationAdapter } from './core/SimulationAdapter';
export { default as BaseWorld } from './core/BaseWorld';
export { default as BaseEntity } from './core/BaseEntity';
export { default as BaseComponent } from './core/BaseComponent';
export { default as BaseSystem } from './core/BaseSystem';

// Hooks
export { default as useCanvasInteraction } from './hooks/useCanvasInteraction';
export { default as useEntitySelection } from './hooks/useEntitySelection';
export { default as useAnimationLoop } from './hooks/useAnimationLoop';
export { default as useStorage } from './hooks/useStorage';

// Utilities
export {
  saveToStorage,
  loadFromStorage,
  hasDataInStorage,
  clearFromStorage
} from './utils/storage';
export {
  DEFAULT_SCALE,
  MIN_SCALE,
  MAX_SCALE,
  AUTOSAVE_INTERVAL,
  AUTOSAVE_MAX_AGE,
  DEFAULT_MINIMAP_SIZE
} from './utils/constants';