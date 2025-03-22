import React, { useState } from 'react';

/**
 * A collapsible help panel with information about the simulation
 */
const HelpPanel = ({ content }) => {
  const [showHelp, setShowHelp] = useState(false);
  
  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };
  
  // Default help content if none provided
  const defaultContent = (
    <>
      <p>This is a simulation framework. Each simulation implements:</p>
      <ul>
        <li>Custom entity types with specific behaviors</li>
        <li>Physics and interaction rules</li>
        <li>Evolution mechanics</li>
      </ul>
      <p>Use the controls below to adjust simulation parameters.</p>
    </>
  );
  
  return (
    <div>
      <button 
        onClick={toggleHelp}
        className="help-toggle"
      >
        {showHelp ? 'Hide Help' : 'Show Help'}
      </button>
      
      {showHelp && (
        <div className="help-content">
          {content || defaultContent}
        </div>
      )}
    </div>
  );
};

export default HelpPanel;