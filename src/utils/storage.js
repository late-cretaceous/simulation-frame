/**
 * Utilities for saving and loading from localStorage
 */

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {Object} data - Data to save
 * @returns {boolean} - Success status
 */
export const saveToStorage = (key, data) => {
    try {
      const serializedData = JSON.stringify({
        timestamp: Date.now(),
        ...data
      });
      
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error(`Failed to save data to ${key}:`, error);
      return false;
    }
  };
  
  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {number} maxAge - Maximum age in milliseconds (default: 7 days)
   * @returns {Object|null} - Loaded data or null
   */
  export const loadFromStorage = (key, maxAge = 7 * 24 * 60 * 60 * 1000) => {
    try {
      const serializedData = localStorage.getItem(key);
      if (!serializedData) return null;
      
      const data = JSON.parse(serializedData);
      
      // Check if data is recent enough
      if (maxAge > 0) {
        const now = Date.now();
        if (!data.timestamp || now - data.timestamp > maxAge) {
          console.log(`Data in ${key} is too old, removing`);
          localStorage.removeItem(key);
          return null;
        }
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to load data from ${key}:`, error);
      return null;
    }
  };
  
  /**
   * Check if data exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - True if data exists
   */
  export const hasDataInStorage = (key) => {
    try {
      return !!localStorage.getItem(key);
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Clear data from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  export const clearFromStorage = (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to clear data from ${key}:`, error);
      return false;
    }
  };