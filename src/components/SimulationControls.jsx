import React from 'react';

/**
 * Controls for adjusting simulation parameters
 */
const SimulationControls = ({ setParameters, ...parameters }) => {
  // Extract parameter information
  const parameterDefs = Object.entries(parameters).map(([key, value]) => {
    const isNumeric = typeof value === 'number';
    return {
      key,
      value,
      isNumeric,
      // Generate a label from the key (e.g., "foodAmount" -> "Food Amount")
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    };
  });
  
  // Handle parameter change
  const handleChange = (key, value) => {
    setParameters(key, value);
  };
  
  return (
    <div className="controls-container">
      {parameterDefs.map(param => (
        <div key={param.key} className="control-item">
          <label className="control-label">{param.label}</label>
          
          {param.isNumeric ? (
            <>
              <input 
                type="range" 
                min={param.min || 0} 
                max={param.max || 100} 
                step={param.step || (Number.isInteger(param.value) ? 1 : 0.1)} 
                value={param.value} 
                onChange={(e) => handleChange(param.key, 
                  Number.isInteger(param.value) ? 
                    parseInt(e.target.value) : 
                    parseFloat(e.target.value)
                )}
                className="control-slider"
              />
              <div className="control-value">
                {Number.isInteger(param.value) ? 
                  param.value : 
                  param.value.toFixed(1)}
                {param.unit ? param.unit : ''}
              </div>
            </>
          ) : (
            typeof param.value === 'boolean' ? (
              <input 
                type="checkbox" 
                checked={param.value} 
                onChange={(e) => handleChange(param.key, e.target.checked)}
              />
            ) : (
              <input 
                type="text" 
                value={param.value} 
                onChange={(e) => handleChange(param.key, e.target.value)}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default SimulationControls;