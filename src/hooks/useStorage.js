import { useCallback } from 'react';

/**
 * Hook for saving and loading state from storage
 */
const useStorage = (storageKey) => {
  /**
   * Save state to localStorage
   * @param {Object} state - The state to save
   * @returns {boolean} - Success status
   */
  const saveState = useCallback((state) => {
    try {
      const serializedState = JSON.stringify({
        timestamp: Date.now(),
        ...state
      });
      
      localStorage.setItem(storageKey, serializedState);
      return true;
    } catch (_) {
      console.error('Failed to save state');
      return false;
    }
  }, [storageKey]);
  
  /**
   * Load state from localStorage
   * @returns {Object|null} - The loaded state or null if not found
   */
  const loadState = useCallback(() => {
    try {
      const serializedState = localStorage.getItem(storageKey);
      if (!serializedState) return null;
      
      const state = JSON.parse(serializedState);
      
      // Check if saved state is recent (within last 7 days)
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      if (!state.timestamp || now - state.timestamp > maxAge) {
        console.log('Saved state is too old, starting fresh');
        localStorage.removeItem(storageKey);
        return null;
      }
      
      return state;
    } catch (_) {
      console.error('Failed to load state, clearing corrupted data');
      localStorage.removeItem(storageKey);
      return null;
    }
  }, [storageKey]);
  
  /**
   * Clear saved state
   * @returns {boolean} - Success status
   */
  const clearState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      return true;
    } catch (_) {
      console.error('Failed to clear state');
      return false;
    }
  }, [storageKey]);
  
  /**
   * Check if there is a saved state
   * @returns {boolean}
   */
  const hasState = useCallback(() => {
    try {
      const state = localStorage.getItem(storageKey);
      return !!state;
    } catch (_) {
      return false;
    }
  }, [storageKey]);
  
  return {
    saveState,
    loadState,
    clearState,
    hasState
  };
};

export default useStorage;