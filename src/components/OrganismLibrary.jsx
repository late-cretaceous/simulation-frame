import React, { useState, useEffect } from 'react';

/**
 * Component for viewing and managing saved organisms
 */
const OrganismLibrary = ({ 
  onSelectOrganism, 
  onClose, 
  getOrganisms,
  saveOrganism 
}) => {
  const [organisms, setOrganisms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveMode, setSaveMode] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);
  
  // Load organisms on mount
  useEffect(() => {
    const savedOrganisms = getOrganisms();
    setOrganisms(savedOrganisms);
  }, [getOrganisms]);
  
  // Handle organism selection
  const handleSelect = (organism) => {
    setSelectedId(organism.id);
  };
  
  // Handle view organism button
  const handleView = () => {
    const selected = organisms.find(org => org.id === selectedId);
    if (selected) {
      onSelectOrganism(selected);
    }
  };
  
  // Enter save mode
  const enterSaveMode = (entity) => {
    setSaveMode(true);
    setCurrentEntity(entity);
    setSaveName(entity.name || '');
    setSaveNotes('');
  };
  
  // Cancel save
  const cancelSave = () => {
    setSaveMode(false);
    setCurrentEntity(null);
    setSaveName('');
    setSaveNotes('');
  };
  
  // Save organism
  const handleSave = () => {
    if (!currentEntity || !saveName) return;
    
    const savedEntity = saveOrganism(currentEntity, saveName, saveNotes);
    if (savedEntity) {
      // Update the organisms list
      setOrganisms([...organisms, savedEntity]);
      
      // Exit save mode
      setSaveMode(false);
      setCurrentEntity(null);
      setSaveName('');
      setSaveNotes('');
    }
  };
  
  return (
    <div className="organism-library-modal">
      <div className="library-content">
        <div className="library-header">
          <h2>Organism Library</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        {saveMode ? (
          <div className="save-form">
            <h3>Save Organism</h3>
            <div className="form-row">
              <label>Name:</label>
              <input 
                type="text" 
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter a name"
              />
            </div>
            <div className="form-row">
              <label>Notes:</label>
              <textarea 
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                placeholder="Add notes (optional)"
              />
            </div>
            <div className="form-actions">
              <button onClick={handleSave} disabled={!saveName}>
                Save
              </button>
              <button onClick={cancelSave}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {organisms.length === 0 ? (
              <div className="empty-library">
                <p>No organisms saved yet.</p>
              </div>
            ) : (
              <div className="organisms-list">
                {organisms.map((organism) => (
                  <div 
                    key={organism.id} 
                    className={`organism-item ${organism.id === selectedId ? 'selected' : ''}`}
                    onClick={() => handleSelect(organism)}
                  >
                    <div className="organism-name">{organism.name}</div>
                    {organism.notes && (
                      <div className="organism-notes">{organism.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="library-actions">
              <button 
                onClick={handleView} 
                disabled={!selectedId}
              >
                View Selected
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganismLibrary;