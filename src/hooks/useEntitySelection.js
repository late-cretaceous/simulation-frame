import { useState, useCallback } from 'react';

/**
 * Hook for handling entity selection
 */
const useEntitySelection = () => {
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEntityData, setSelectedEntityData] = useState(null);
  
  /**
   * Clear the current selection
   */
  const clearSelection = useCallback(() => {
    setSelectedEntityId(null);
    setSelectedEntityData(null);
  }, []);
  
  /**
   * Set entity data directly
   * @param {Object} data - Entity data
   */
  const setEntityData = useCallback((data) => {
    if (!data) {
      clearSelection();
      return;
    }
    
    setSelectedEntityId(data.id || 'external');
    setSelectedEntityData(data);
  }, [clearSelection]);
  
  return {
    selectedEntityId,
    selectedEntityData,
    clearSelection,
    setEntityData
  };
};

export default useEntitySelection;