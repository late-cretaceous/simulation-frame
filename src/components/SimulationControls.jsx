import React from 'react';

/**
 * Controls for adjusting simulation parameters with enhanced UI
 * Now supports dynamic parameters defined by each simulation
 */
const SimulationControls = ({ parameters, parameterMetadata, setParameters }) => {
  // Handle parameter change
  const handleChange = (key, value) => {
    setParameters(key, value);
  };
  
  // Handle numeric input change to validate numbers
  const handleNumericInputChange = (key, inputValue, metadata) => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= metadata.min && numValue <= metadata.max) {
      handleChange(key, Number.isInteger(parameters[key]) ? Math.round(numValue) : numValue);
    }
  };
  
  // If no parameters or metadata available, show a message
  if (!parameters || !parameterMetadata || Object.keys(parameterMetadata).length === 0) {
    return (
      <div className="controls-container">
        <h3 className="controls-header">Simulation Parameters</h3>
        <div className="controls-body">
          <p className="no-parameters-message">No adjustable parameters available for this simulation.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="controls-container">
      <h3 className="controls-header">Simulation Parameters</h3>
      <div className="controls-body">
        {Object.keys(parameterMetadata).map((key) => {
          const metadata = parameterMetadata[key];
          const value = parameters[key];
          
          return (
            <div key={key} className="control-item">
              <div className="control-header">
                <label className="control-label" htmlFor={`param-${key}`}>
                  {metadata.label}
                </label>
                <div className="control-value">
                  {metadata.type === 'number' ? (
                    <input
                      type="number"
                      id={`param-input-${key}`}
                      value={value}
                      min={metadata.min}
                      max={metadata.max}
                      step={metadata.step}
                      onChange={(e) => handleNumericInputChange(key, e.target.value, metadata)}
                      className="control-number-input"
                    />
                  ) : metadata.type === 'boolean' ? (
                    value ? "On" : "Off"
                  ) : (
                    value
                  )}
                </div>
              </div>
              
              {metadata.type === 'number' && (
                <div className="control-slider-container">
                  <input 
                    type="range" 
                    id={`param-${key}`}
                    min={metadata.min} 
                    max={metadata.max} 
                    step={metadata.step} 
                    value={value} 
                    onChange={(e) => handleChange(
                      key, 
                      Number.isInteger(value) ? 
                        parseInt(e.target.value) : 
                        parseFloat(e.target.value)
                    )}
                    className="control-slider"
                    data-tooltip={metadata.description}
                  />
                  <div className="slider-markers">
                    <span className="slider-min">{metadata.min}</span>
                    <span className="slider-max">{metadata.max}</span>
                  </div>
                </div>
              )}
              
              {metadata.type === 'boolean' && (
                <label className="control-switch">
                  <input 
                    type="checkbox" 
                    checked={value} 
                    onChange={(e) => handleChange(key, e.target.checked)}
                    data-tooltip={metadata.description}
                  />
                  <span className="switch-slider"></span>
                </label>
              )}
              
              {metadata.type === 'string' && (
                <input 
                  type="text" 
                  value={value} 
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="control-text-input"
                  data-tooltip={metadata.description}
                />
              )}
              
              <p className="control-description">{metadata.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimulationControls;