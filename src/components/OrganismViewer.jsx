import React from 'react';

/**
 * Component for viewing details of a selected organism
 */
const OrganismViewer = ({ 
  organismData, 
  onClose, 
  generation,
  onViewLibrary 
}) => {
  if (!organismData) {
    return (
      <div className="organism-viewer empty-viewer">
        <h3>No Organism Selected</h3>
        <p>Click on an organism in the simulation to view its details.</p>
        <button onClick={onViewLibrary} className="library-button">
          View Organism Library
        </button>
      </div>
    );
  }

  // Determine which properties to display
  const propertiesToShow = Object.entries(organismData)
    .filter(([key]) => {
      // Filter out certain properties we don't want to show
      return !['id', 'components', 'entity', 'constructor'].includes(key);
    });

  return (
    <div className="organism-viewer">
      <div className="viewer-header">
        <h3>Organism Details</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="viewer-content">
        <div className="organism-id">ID: {organismData.id}</div>
        <div className="organism-generation">Generation: {generation}</div>
        
        {propertiesToShow.length > 0 && (
          <div className="organism-properties">
            {propertiesToShow.map(([key, value]) => (
              <div key={key} className="property-row">
                <span className="property-name">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </span>
                <span className="property-value">
                  {typeof value === 'number' 
                    ? (Number.isInteger(value) ? value : value.toFixed(2)) 
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="viewer-actions">
          <button 
            onClick={onViewLibrary} 
            className="library-button"
          >
            View Organism Library
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganismViewer;