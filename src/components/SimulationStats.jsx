import React from 'react';

/**
 * Displays simulation statistics and control buttons with enhanced UI
 */
const SimulationStats = ({ 
  generation, 
  stats, 
  isRunning, 
  onToggleSimulation, 
  onRestartSimulation,
  showRestartConfirmation,
  onConfirmRestart,
  onCancelRestart,
  lastAutosaveTime
}) => {
  // Format the last autosave time
  const formatLastSaveTime = () => {
    if (!lastAutosaveTime) return 'Not saved yet';
    
    const now = new Date();
    const diffMs = now - lastAutosaveTime;
    
    // If less than a minute, show "just now"
    if (diffMs < 60000) {
      return 'Just now';
    }
    
    // If less than an hour, show minutes
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Format as time
    return lastAutosaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter out generation from stats as it's displayed separately
  const filteredStats = stats ? Object.entries(stats).filter(([key]) => key !== 'generation') : [];
  
  return (
    <div className="stats-container">
      <div className="stats-primary">
        <div className="generation-display">
          <span className="generation-label">Generation</span>
          <span className="generation-value">{generation}</span>
        </div>
        
        <div className="buttons-container">
          <button 
            onClick={onToggleSimulation}
            className={`button ${isRunning ? 'button-blue' : 'button-green'}`}
          >
            {isRunning ? (
              <>
                <span className="button-icon">⏸</span>
                <span className="button-text">Pause</span>
              </>
            ) : (
              <>
                <span className="button-icon">▶️</span>
                <span className="button-text">Resume</span>
              </>
            )}
          </button>
          
          {!showRestartConfirmation ? (
            <button
              onClick={onRestartSimulation}
              className="button button-red"
              data-tooltip="Reset the simulation"
            >
              <span className="button-icon">↺</span>
              <span className="button-text">Restart</span>
            </button>
          ) : (
            <div className="confirmation-buttons">
              <button
                onClick={onConfirmRestart}
                className="button button-red"
              >
                Confirm
              </button>
              <button
                onClick={onCancelRestart}
                className="button button-green"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showRestartConfirmation && (
        <div className="restart-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">Warning: Restarting will erase all current progress. Continue?</span>
        </div>
      )}
      
      <div className="stats-details">
        <div className="stats-grid">
          {filteredStats.map(([key, value]) => (
            <div key={key} className="stat-item">
              <div className="stat-label">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
              <div className="stat-value">
                {typeof value === 'number' ? 
                  (Number.isInteger(value) ? value : value.toFixed(1)) :
                  value}
              </div>
            </div>
          ))}
        </div>
        
        <div className="autosave-info">
          <span className="autosave-icon">💾</span>
          <span className="autosave-text">Last autosave: {formatLastSaveTime()}</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationStats;