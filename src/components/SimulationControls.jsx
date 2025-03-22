import React from 'react';

/**
 * Controls for adjusting simulation parameters with enhanced UI
 */
const SimulationControls = ({ setParameters, ...parameters }) => {
  // Extract parameter information
  const parameterDefs = Object.entries(parameters).map(([key, value]) => {
    const isNumeric = typeof value === 'number';
    const isBoolean = typeof value === 'boolean';
    
    // Generate a label from the key (e.g., "foodAmount" -> "Food Amount")
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Determine parameter properties
    let min, max, step;
    if (isNumeric) {
      // Default ranges based on parameter name patterns
      if (key.includes('Count') || key.includes('Amount')) {
        min = 0;
        max = value * 2 || 100;
        step = 1;
      } else if (key.includes('Size')) {
        min = 1;
        max = 20;
        step = 1;
      } else if (key.includes('Speed') || key.includes('Rate')) {
        min = 0;
        max = 2;
        step = 0.1;
      } else {
        min = 0;
        max = 100;
        step = Number.isInteger(value) ? 1 : 0.1;
      }
    }
    
    return {
      key,
      value,
      isNumeric,
      isBoolean,
      label,
      min,
      max,
      step,
      // Generate an appropriate tooltip description
      tooltip: getTooltipForParameter(key)
    };
  });
  
  // Handle parameter change
  const handleChange = (key, value) => {
    setParameters(key, value);
  };
  
  // Handle numeric input change to validate numbers
  const handleNumericInputChange = (key, inputValue, paramDef) => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= paramDef.min && numValue <= paramDef.max) {
      handleChange(key, Number.isInteger(paramDef.value) ? Math.round(numValue) : numValue);
    }
  };
  
  // Get tooltip description for parameter
  function getTooltipForParameter(key) {
    const tooltips = {
      organismCount: "Number of organisms in the simulation",
      foodAmount: "Amount of food available in the environment",
      speed: "Speed multiplier for the simulation",
      entitySize: "Size of the organism entities"
    };
    
    return tooltips[key] || `Adjust the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} parameter`;
  }
  
  return (
    <div className="controls-container">
      <h3 className="controls-header">Simulation Parameters</h3>
      <div className="controls-body">
        {parameterDefs.map((param) => (
          <div key={param.key} className="control-item">
            <div className="control-header">
              <label className="control-label" htmlFor={`param-${param.key}`}>
                {param.label}
              </label>
              <div className="control-value">
                {param.isNumeric ? (
                  <>
                    <input
                      type="number"
                      id={`param-input-${param.key}`}
                      value={param.value}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      onChange={(e) => handleNumericInputChange(param.key, e.target.value, param)}
                      className="control-number-input"
                    />
                  </>
                ) : param.isBoolean ? (
                  param.value ? "On" : "Off"
                ) : (
                  param.value
                )}
              </div>
            </div>
            
            {param.isNumeric && (
              <div className="control-slider-container">
                <input 
                  type="range" 
                  id={`param-${param.key}`}
                  min={param.min} 
                  max={param.max} 
                  step={param.step} 
                  value={param.value} 
                  onChange={(e) => handleChange(
                    param.key, 
                    Number.isInteger(param.value) ? 
                      parseInt(e.target.value) : 
                      parseFloat(e.target.value)
                  )}
                  className="control-slider"
                  data-tooltip={param.tooltip}
                />
                <div className="slider-markers">
                  <span className="slider-min">{param.min}</span>
                  <span className="slider-max">{param.max}</span>
                </div>
              </div>
            )}
            
            {param.isBoolean && (
              <label className="control-switch">
                <input 
                  type="checkbox" 
                  checked={param.value} 
                  onChange={(e) => handleChange(param.key, e.target.checked)}
                  data-tooltip={param.tooltip}
                />
                <span className="switch-slider"></span>
              </label>
            )}
            
            {!param.isNumeric && !param.isBoolean && (
              <input 
                type="text" 
                value={param.value} 
                onChange={(e) => handleChange(param.key, e.target.value)}
                className="control-text-input"
                data-tooltip={param.tooltip}
              />
            )}
            
            <p className="control-description">{param.tooltip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationControls;