/**
 * EnhancedBaseWorld
 * 
 * Improved base world implementation with:
 * - Auto-initialization
 * - Circuit breakers to prevent infinite loops
 * - Comprehensive error handling
 * - Self-healing mechanisms
 * - Transaction-based entity operations
 */

export class EnhancedBaseWorld {
  /**
   * Create a new world instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Initialize with options
    this.options = {
      autoInitialize: true,          // Auto-initialize on first use
      safeMode: true,                // Enable safety checks and automatic recovery
      debugMode: false,              // Enable additional debugging
      maxEntities: 10000,            // Maximum allowed entities
      ...options
    };
    
    // Entity storage - using Map for O(1) access by ID
    this.entities = new Map();
    
    // Systems storage - array for ordered execution
    this.systems = [];
    
    // Entity ID counter
    this.nextEntityId = 1;
    
    // Component type registry (for type checking)
    this.componentTypes = new Set();
    
    // Track initialization state
    this.isInitialized = false;
    
    // Error tracking
    this._lastError = null;
    this._errors = [];
    this._maxErrors = 100;
    
    // Stats tracking
    this._stats = {
      entitiesCreated: 0,
      entitiesRemoved: 0,
      componentsAdded: 0,
      componentsRemoved: 0,
      systemsAdded: 0,
      systemsRemoved: 0,
      updateCalls: 0,
      lastUpdateTime: 0,
      totalUpdateTime: 0
    };
    
    // Circuit breaker state
    this._circuitBreaker = {
      initCheckCount: 0,
      initCheckMaxAttempts: 5,
      consecutiveErrors: 0,
      maxConsecutiveErrors: 10,
      tripped: false,
      lastTripTime: 0,
      tripTimeout: 5000 // 5 seconds
    };
    
    // Transaction support
    this._transaction = {
      active: false,
      operations: [],
      created: new Map(),
      removed: new Set()
    };
    
    // Auto-initialize if enabled
    if (this.options.autoInitialize) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the world
   * Must be called before using other methods if autoInitialize is false
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  initialize() {
    try {
      // Skip if already initialized
      if (this.isInitialized) {
        this._logDebug('World already initialized, skipping');
        return this;
      }
      
      // Mark as initialized
      this.isInitialized = true;
      this._circuitBreaker.initCheckCount = 0;
      
      // Initialize systems if needed
      for (const system of this.systems) {
        if (system && system.initialize && typeof system.initialize === 'function') {
          try {
            system.initialize(this);
          } catch (error) {
            this._trackError('initialize-system', error, system.constructor.name);
          }
        }
      }
      
      this._logDebug('World initialized successfully');
      return this;
    } catch (error) {
      this._trackError('initialize', error);
      return this;
    }
  }
  
  /**
   * Ensure the world is initialized before performing operations
   * Will auto-initialize if enabled
   * @returns {boolean} - True if world is initialized
   * @private
   */
  _ensureInitialized() {
    // Check circuit breaker
    if (this._isCircuitBreakerTripped()) {
      return false;
    }
    
    // If already initialized, we're good
    if (this.isInitialized) {
      return true;
    }
    
    // Track attempt count
    this._circuitBreaker.initCheckCount++;
    
    // Check max attempts for circuit breaker
    if (this._circuitBreaker.initCheckCount > this._circuitBreaker.initCheckMaxAttempts) {
      this._tripCircuitBreaker('Too many initialization checks, possible infinite loop');
      return false;
    }
    
    // Auto-initialize if enabled
    if (this.options.autoInitialize) {
      this._logDebug(`Auto-initializing world (attempt ${this._circuitBreaker.initCheckCount})`);
      this.initialize();
      return this.isInitialized;
    }
    
    // Not initialized and auto-init disabled
    this._logWarning('World not initialized. Call initialize() before using other methods.');
    return false;
  }
  
  /**
   * Check if circuit breaker is tripped
   * @returns {boolean} - True if circuit breaker is tripped
   * @private
   */
  _isCircuitBreakerTripped() {
    if (!this._circuitBreaker.tripped) {
      return false;
    }
    
    // Check if we can reset the circuit breaker
    const now = Date.now();
    if (now - this._circuitBreaker.lastTripTime > this._circuitBreaker.tripTimeout) {
      this._resetCircuitBreaker();
      return false;
    }
    
    return true;
  }
  
  /**
   * Trip the circuit breaker to prevent further operations
   * @param {string} reason - Reason for tripping
   * @private
   */
  _tripCircuitBreaker(reason) {
    this._circuitBreaker.tripped = true;
    this._circuitBreaker.lastTripTime = Date.now();
    this._logError(`Circuit breaker tripped: ${reason}`);
  }
  
  /**
   * Reset the circuit breaker
   * @private
   */
  _resetCircuitBreaker() {
    this._circuitBreaker.tripped = false;
    this._circuitBreaker.initCheckCount = 0;
    this._circuitBreaker.consecutiveErrors = 0;
    this._logDebug('Circuit breaker reset');
  }
  
  /**
   * Begin a transaction for batching entity operations
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  beginTransaction() {
    if (this._transaction.active) {
      this._logWarning('Transaction already active, nesting not supported');
      return this;
    }
    
    this._transaction.active = true;
    this._transaction.operations = [];
    this._transaction.created.clear();
    this._transaction.removed.clear();
    
    return this;
  }
  
  /**
   * Commit the current transaction
   * @returns {boolean} - True if transaction was committed successfully
   */
  commitTransaction() {
    if (!this._transaction.active) {
      this._logWarning('No active transaction to commit');
      return false;
    }
    
    try {
      // Execute all operations
      for (const op of this._transaction.operations) {
        // Skip operations on removed entities
        if (op.type.startsWith('entity_') && op.entityId && this._transaction.removed.has(op.entityId)) {
          continue;
        }
        
        // Execute operation
        switch (op.type) {
          case 'entity_create':
            // Entity already created in createEntity during transaction
            break;
            
          case 'entity_remove':
            // Process entity removal
            this._removeEntityDirectly(op.entityId);
            break;
            
          case 'component_add':
            // Process component addition
            const entity = this.entities.get(op.entityId);
            if (entity) {
              entity.components.set(op.component.constructor.name, op.component);
              op.component.entity = entity;
              this._stats.componentsAdded++;
            }
            break;
            
          case 'component_remove':
            // Process component removal
            const targetEntity = this.entities.get(op.entityId);
            if (targetEntity) {
              const component = targetEntity.components.get(op.componentName);
              if (component) {
                component.entity = null;
                targetEntity.components.delete(op.componentName);
                this._stats.componentsRemoved++;
              }
            }
            break;
        }
      }
      
      // Finished transaction
      this._transaction.active = false;
      return true;
    } catch (error) {
      this._trackError('commit-transaction', error);
      
      // Attempt to rollback on failure
      try {
        this.rollbackTransaction();
      } catch (rollbackError) {
        this._trackError('rollback-transaction', rollbackError);
      }
      
      return false;
    }
  }
  
  /**
   * Rollback the current transaction
   * @returns {boolean} - True if transaction was rolled back successfully
   */
  rollbackTransaction() {
    if (!this._transaction.active) {
      this._logWarning('No active transaction to rollback');
      return false;
    }
    
    try {
      // Remove entities created during this transaction
      for (const [entityId, entity] of this._transaction.created) {
        if (this.entities.has(entityId)) {
          // Clean up components
          for (const component of entity.components.values()) {
            if (component) {
              component.entity = null;
            }
          }
          
          // Remove from entities map
          this.entities.delete(entityId);
          this._stats.entitiesRemoved++;
        }
      }
      
      // Reset transaction state
      this._transaction.active = false;
      this._transaction.operations = [];
      this._transaction.created.clear();
      this._transaction.removed.clear();
      
      return true;
    } catch (error) {
      this._trackError('rollback-transaction', error);
      
      // Force reset transaction state
      this._transaction.active = false;
      return false;
    }
  }
  
  /**
   * Create a new entity
   * @returns {Object} - The created entity with an ID and components map
   */
  createEntity() {
    // Check initialization
    if (!this._ensureInitialized()) {
      return this._createEmptyEntityFallback();
    }
    
    try {
      // Check entity limit
      if (this.entities.size >= this.options.maxEntities) {
        this._logWarning(`Entity limit reached (${this.options.maxEntities})`);
        return this._createEmptyEntityFallback();
      }
      
      // Create entity ID
      const entityId = this.nextEntityId++;
      
      // Create entity object
      const entity = {
        id: entityId,
        components: new Map(),
        world: this,
        
        // Convenience methods for component management
        addComponent(component) {
          if (!component) return this;
          
          // Use transaction if active
          if (world._transaction.active) {
            world._transaction.operations.push({
              type: 'component_add',
              entityId: this.id,
              component
            });
          } else {
            // Direct operation
            this.components.set(component.constructor.name, component);
            component.entity = this;
            world._stats.componentsAdded++;
          }
          
          return this;
        },
        
        removeComponent(componentClass) {
          const componentName = typeof componentClass === 'string' 
            ? componentClass 
            : componentClass.name;
          
          // Use transaction if active
          if (world._transaction.active) {
            world._transaction.operations.push({
              type: 'component_remove',
              entityId: this.id,
              componentName
            });
          } else {
            // Direct operation
            const component = this.components.get(componentName);
            if (component) {
              component.entity = null;
              this.components.delete(componentName);
              world._stats.componentsRemoved++;
            }
          }
          
          return this;
        },
        
        getComponent(componentClass) {
          const componentName = typeof componentClass === 'string' 
            ? componentClass 
            : componentClass.name;
          return this.components.get(componentName);
        },
        
        hasComponent(componentClass) {
          const componentName = typeof componentClass === 'string' 
            ? componentClass 
            : componentClass.name;
          return this.components.has(componentName);
        },
        
        // Get the world this entity belongs to
        getWorld() {
          return world;
        }
      };
      
      // Store reference to this world for closures
      const world = this;
      
      // Add to entities map
      this.entities.set(entityId, entity);
      this._stats.entitiesCreated++;
      
      // Track in transaction if active
      if (this._transaction.active) {
        this._transaction.created.set(entityId, entity);
      }
      
      return entity;
    } catch (error) {
      this._trackError('create-entity', error);
      return this._createEmptyEntityFallback();
    }
  }
  
  /**
   * Create an empty entity fallback that gracefully handles errors
   * @returns {Object} - A dummy entity that won't cause errors if used
   * @private
   */
  _createEmptyEntityFallback() {
    // Create an empty entity that won't cause errors if used
    return {
      id: -1,
      components: new Map(),
      world: null,
      addComponent: () => { return this; },
      removeComponent: () => { return this; },
      getComponent: () => null,
      hasComponent: () => false,
      getWorld: () => null
    };
  }

  /**
   * Remove an entity by ID
   * @param {number} entityId - Entity ID
   * @returns {boolean} - True if entity was removed, false if not found
   */
  removeEntity(entityId) {
    // Check initialization
    if (!this._ensureInitialized()) {
      return false;
    }
    
    try {
      // Check if entity exists
      if (!this.entities.has(entityId)) {
        this._logDebug(`Cannot remove entity with ID ${entityId} - not found`);
        return false;
      }
      
      // Use transaction if active
      if (this._transaction.active) {
        this._transaction.operations.push({
          type: 'entity_remove',
          entityId
        });
        
        // Track in removed set
        this._transaction.removed.add(entityId);
        
        return true;
      } else {
        // Direct removal
        return this._removeEntityDirectly(entityId);
      }
    } catch (error) {
      this._trackError('remove-entity', error, entityId);
      return false;
    }
  }
  
  /**
   * Remove an entity directly (not through transaction)
   * @param {number} entityId - Entity ID
   * @returns {boolean} - True if entity was removed
   * @private
   */
  _removeEntityDirectly(entityId) {
    // Get the entity
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    // Clean up component references
    for (const component of entity.components.values()) {
      if (component) {
        component.entity = null;
        
        // Call cleanup if available
        if (typeof component.cleanup === 'function') {
          try {
            component.cleanup();
          } catch (error) {
            this._trackError('component-cleanup', error, entityId);
          }
        }
      }
    }
    
    // Remove entity
    entity.world = null;
    this.entities.delete(entityId);
    this._stats.entitiesRemoved++;
    
    return true;
  }

  /**
   * Get an entity by ID
   * @param {number} entityId - Entity ID
   * @returns {Object|undefined} - The entity or undefined if not found
   */
  getEntity(entityId) {
    // Check initialization
    if (!this._ensureInitialized()) {
      return undefined;
    }
    
    // Transaction check - don't return entity marked for removal
    if (this._transaction.active && this._transaction.removed.has(entityId)) {
      return undefined;
    }
    
    return this.entities.get(entityId);
  }

  /**
   * Add a system to this world
   * @param {Object} system - The system to add (must have an update method)
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  addSystem(system) {
    // Check initialization
    if (!this._ensureInitialized()) {
      return this;
    }
    
    try {
      if (!system) {
        this._logWarning('Cannot add null or undefined system');
        return this;
      }
      
      // Validate system has update method
      if (typeof system.update !== 'function') {
        this._logWarning('Adding system without update method. This system will not process entities.');
      }
      
      // Set world reference if system supports it
      if (typeof system.setWorld === 'function') {
        system.setWorld(this);
      } else {
        system.world = this;
      }
      
      // Add to systems array
      this.systems.push(system);
      this._stats.systemsAdded++;
      
      // Initialize system if world is already initialized
      if (this.isInitialized && typeof system.initialize === 'function') {
        try {
          system.initialize(this);
        } catch (error) {
          this._trackError('initialize-system', error, system.constructor?.name || 'unknown');
        }
      }
      
      return this;
    } catch (error) {
      this._trackError('add-system', error, system?.constructor?.name || 'unknown');
      return this;
    }
  }

  /**
   * Remove a system from this world
   * @param {Object} system - The system to remove
   * @returns {boolean} - True if removed, false if not found
   */
  removeSystem(system) {
    // Check initialization
    if (!this._ensureInitialized()) {
      return false;
    }
    
    try {
      const index = this.systems.indexOf(system);
      if (index !== -1) {
        // Call cleanup if system supports it
        if (typeof system.cleanup === 'function') {
          try {
            system.cleanup();
          } catch (error) {
            this._trackError('system-cleanup', error, system.constructor?.name || 'unknown');
          }
        }
        
        // Clear world reference
        system.world = null;
        
        // Remove from array
        this.systems.splice(index, 1);
        this._stats.systemsRemoved++;
        
        return true;
      }
      return false;
    } catch (error) {
      this._trackError('remove-system', error, system?.constructor?.name || 'unknown');
      return false;
    }
  }

  /**
   * Update all systems
   * @param {number} deltaTime - Time elapsed since last update
   * @returns {boolean} - True if update was performed
   */
  update(deltaTime) {
    // Check initialization
    if (!this._ensureInitialized()) {
      return false;
    }
    
    try {
      const startTime = performance.now();
      this._stats.updateCalls++;
      
      // Process each system
      for (const system of this.systems) {
        if (system && typeof system.update === 'function') {
          try {
            // Track system update time if debugging is enabled
            if (this.options.debugMode) {
              const systemStartTime = performance.now();
              
              // Update the system
              system.update(deltaTime);
              
              // Record update time
              const systemUpdateTime = performance.now() - systemStartTime;
              const systemName = system.constructor?.name || 'unknown';
              
              if (!this._stats.systemUpdateTimes) {
                this._stats.systemUpdateTimes = {};
              }
              
              if (!this._stats.systemUpdateTimes[systemName]) {
                this._stats.systemUpdateTimes[systemName] = {
                  calls: 0,
                  totalTime: 0,
                  averageTime: 0,
                  maxTime: 0
                };
              }
              
              const systemStats = this._stats.systemUpdateTimes[systemName];
              systemStats.calls++;
              systemStats.totalTime += systemUpdateTime;
              systemStats.averageTime = systemStats.totalTime / systemStats.calls;
              systemStats.maxTime = Math.max(systemStats.maxTime, systemUpdateTime);
            } else {
              // Just update the system
              system.update(deltaTime);
            }
          } catch (error) {
            this._trackError('system-update', error, system.constructor?.name || 'unknown');
            
            // Track consecutive errors for circuit breaker
            this._circuitBreaker.consecutiveErrors++;
            
            // Trip circuit breaker if too many consecutive errors
            if (this._circuitBreaker.consecutiveErrors >= this._circuitBreaker.maxConsecutiveErrors) {
              this._tripCircuitBreaker('Too many consecutive system update errors');
            }
          }
        }
      }
      
      // Reset consecutive errors counter if we got here without errors
      this._circuitBreaker.consecutiveErrors = 0;
      
      // Update stats
      const updateTime = performance.now() - startTime;
      this._stats.lastUpdateTime = updateTime;
      this._stats.totalUpdateTime += updateTime;
      
      return true;
    } catch (error) {
      this._trackError('update', error);
      return false;
    }
  }

  /**
   * Get all entities with a specific component
   * @param {string|Function} componentType - Component type name or constructor
   * @returns {Array} - Array of entities with the component
   */
  getEntitiesWithComponent(componentType) {
    // Check initialization
    if (!this._ensureInitialized()) {
      return [];
    }
    
    try {
      const componentName = typeof componentType === 'string' 
        ? componentType 
        : componentType.name;
      
      const result = [];
      
      // Get entities with the component
      for (const [entityId, entity] of this.entities) {
        // Skip entities in transaction marked for removal
        if (this._transaction.active && this._transaction.removed.has(entityId)) {
          continue;
        }
        
        if (entity.components.has(componentName)) {
          result.push(entity);
        }
      }
      
      return result;
    } catch (error) {
      this._trackError('get-entities-with-component', error, 
        typeof componentType === 'string' ? componentType : componentType.name);
      return [];
    }
  }

  /**
   * Get count of entities
   * @returns {number} - Number of entities in the world
   */
  getEntityCount() {
    return this.entities.size;
  }

  /**
   * Get count of systems
   * @returns {number} - Number of systems in the world
   */
  getSystemCount() {
    return this.systems.length;
  }

  /**
   * Clear all entities
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  clear() {
    // Check initialization
    if (!this._ensureInitialized()) {
      return this;
    }
    
    try {
      // Begin a transaction for bulk operations
      this.beginTransaction();
      
      // Track entities to remove
      const entityIds = Array.from(this.entities.keys());
      
      // Add removal operations for all entities
      for (const entityId of entityIds) {
        this._transaction.operations.push({
          type: 'entity_remove',
          entityId
        });
        
        // Track in removed set
        this._transaction.removed.add(entityId);
      }
      
      // Commit transaction
      this.commitTransaction();
      
      // Reset entity ID counter
      this.nextEntityId = 1;
      
      return this;
    } catch (error) {
      this._trackError('clear', error);
      
      // Try to rollback if in transaction
      if (this._transaction.active) {
        this.rollbackTransaction();
      }
      
      return this;
    }
  }
  
  /**
   * Perform full cleanup/disposal of the world
   */
  dispose() {
    try {
      // Cleanup systems
      for (const system of this.systems) {
        if (typeof system.cleanup === 'function') {
          try {
            system.cleanup();
          } catch (error) {
            this._trackError('system-cleanup', error, system.constructor?.name || 'unknown');
          }
        }
        system.world = null;
      }
      
      // Clear entities
      this.clear();
      
      // Clear systems
      this.systems = [];
      
      // Mark as uninitialized
      this.isInitialized = false;
      
      // Reset circuit breaker
      this._resetCircuitBreaker();
    } catch (error) {
      this._trackError('dispose', error);
    }
  }
  
  /**
   * Get system by type (name or constructor)
   * @param {string|Function} systemType - System type name or constructor
   * @returns {Object|null} - The system or null if not found
   */
  getSystem(systemType) {
    if (!this._ensureInitialized()) {
      return null;
    }
    
    try {
      const typeName = typeof systemType === 'string' 
        ? systemType 
        : systemType.name;
      
      for (const system of this.systems) {
        const systemName = system.constructor?.name || '';
        if (systemName === typeName) {
          return system;
        }
      }
      
      return null;
    } catch (error) {
      this._trackError('get-system', error, 
        typeof systemType === 'string' ? systemType : systemType.name);
      return null;
    }
  }
  
  /**
   * Register a component type
   * @param {Function} componentConstructor - Component constructor
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  registerComponentType(componentConstructor) {
    if (!componentConstructor || typeof componentConstructor !== 'function') {
      this._logWarning('Invalid component constructor');
      return this;
    }
    
    try {
      this.componentTypes.add(componentConstructor.name);
      return this;
    } catch (error) {
      this._trackError('register-component-type', error, componentConstructor.name);
      return this;
    }
  }
  
  /**
   * Check if a component type is registered
   * @param {string|Function} componentType - Component type name or constructor
   * @returns {boolean} - True if component type is registered
   */
  isComponentTypeRegistered(componentType) {
    try {
      const typeName = typeof componentType === 'string' 
        ? componentType 
        : componentType.name;
      
      return this.componentTypes.has(typeName);
    } catch (error) {
      this._trackError('check-component-type', error,
        typeof componentType === 'string' ? componentType : componentType.name);
      return false;
    }
  }
  
  /**
   * Register component constructors for auto-creation
   * @param {Object} componentRegistry - Object mapping component names to constructor functions
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  registerComponents(componentRegistry) {
    if (!componentRegistry || typeof componentRegistry !== 'object') {
      this._logWarning('Invalid component registry');
      return this;
    }
    
    try {
      // Initialize component registry if not exists
      if (!this._componentRegistry) {
        this._componentRegistry = new Map();
      }
      
      // Add each component constructor to registry
      Object.entries(componentRegistry).forEach(([name, constructor]) => {
        if (typeof constructor === 'function') {
          this._componentRegistry.set(name, constructor);
          this.componentTypes.add(name);
        } else {
          this._logWarning(`Invalid component constructor for ${name}`);
        }
      });
      
      return this;
    } catch (error) {
      this._trackError('register-components', error);
      return this;
    }
  }
  
  /**
   * Check if a component type can be auto-created
   * @param {string} componentType - Component type name
   * @returns {boolean} - True if component can be created
   */
  canCreateComponent(componentType) {
    return this._componentRegistry && this._componentRegistry.has(componentType);
  }
  
  /**
   * Create a default component instance of the specified type
   * @param {string} componentType - Component type name
   * @param {Object} entity - Entity to attach component to
   * @returns {Object|null} - New component instance or null if cannot create
   */
  createDefaultComponent(componentType, entity) {
    try {
      if (!this._componentRegistry || !this._componentRegistry.has(componentType)) {
        return null;
      }
      
      // Get constructor
      const ComponentConstructor = this._componentRegistry.get(componentType);
      
      // Create new instance
      const component = new ComponentConstructor();
      
      // Track component creation
      this._stats.componentsAdded++;
      
      return component;
    } catch (error) {
      this._trackError('create-default-component', error, componentType);
      return null;
    }
  }
  
  /**
   * Get a null object implementation for the specified component type
   * @param {string} componentType - Component type name
   * @returns {Object} - Null object implementation that won't cause errors
   */
  getNullComponent(componentType) {
    // Check if we have a specific null implementation for this type
    if (this._nullComponentImplementations && 
        this._nullComponentImplementations.has(componentType)) {
      return this._nullComponentImplementations.get(componentType)();
    }
    
    // Return a generic null object that won't cause errors
    return {
      type: componentType,
      enabled: false,
      entity: null,
      isNull: true,
      
      // Add methods to prevent common errors
      isValid: () => false,
      initialize: () => { return this; },
      cleanup: () => { return this; },
      getWorld: () => null
    };
  }
  
  /**
   * Register null component implementations for specific component types
   * @param {Object} implementations - Object mapping component names to factory functions
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  registerNullComponents(implementations) {
    if (!implementations || typeof implementations !== 'object') {
      return this;
    }
    
    try {
      // Initialize null implementation registry if not exists
      if (!this._nullComponentImplementations) {
        this._nullComponentImplementations = new Map();
      }
      
      // Add each implementation
      Object.entries(implementations).forEach(([name, factory]) => {
        if (typeof factory === 'function') {
          this._nullComponentImplementations.set(name, factory);
        }
      });
      
      return this;
    } catch (error) {
      this._trackError('register-null-components', error);
      return this;
    }
  }
  
  /**
   * Get statistics about the world
   * @returns {Object} - Statistics object
   */
  getStatistics() {
    // Always return stats even if not initialized
    return {
      initialized: this.isInitialized,
      entityCount: this.entities.size,
      systemCount: this.systems.length,
      entitiesCreated: this._stats.entitiesCreated,
      entitiesRemoved: this._stats.entitiesRemoved,
      componentsAdded: this._stats.componentsAdded,
      componentsRemoved: this._stats.componentsRemoved,
      updateCalls: this._stats.updateCalls,
      lastUpdateTime: this._stats.lastUpdateTime,
      totalUpdateTime: this._stats.totalUpdateTime,
      averageUpdateTime: this._stats.updateCalls > 0 ? 
        this._stats.totalUpdateTime / this._stats.updateCalls : 0,
      circuitBreakerTripped: this._circuitBreaker.tripped,
      errorCount: this._errors.length
    };
  }
  
  /**
   * Get detailed performance statistics
   * @returns {Object} - Performance statistics
   */
  getPerformanceStats() {
    if (!this.options.debugMode) {
      return { debugMode: false };
    }
    
    return {
      debugMode: true,
      systemUpdateTimes: this._stats.systemUpdateTimes || {},
      updateCalls: this._stats.updateCalls,
      lastUpdateTime: this._stats.lastUpdateTime,
      totalUpdateTime: this._stats.totalUpdateTime,
      averageUpdateTime: this._stats.updateCalls > 0 ? 
        this._stats.totalUpdateTime / this._stats.updateCalls : 0
    };
  }
  
  /**
   * Track an error
   * @param {string} source - Error source
   * @param {Error} error - Error object
   * @param {string} context - Additional context
   * @private
   */
  _trackError(source, error, context = '') {
    // Store last error
    this._lastError = {
      source,
      error,
      context,
      time: new Date()
    };
    
    // Add to errors array
    this._errors.push(this._lastError);
    
    // Limit errors array
    if (this._errors.length > this._maxErrors) {
      this._errors.shift();
    }
    
    // Log error
    this._logError(`Error in ${source}${context ? ` (${context})` : ''}: ${error.message || error}`, error);
  }
  
  /**
   * Log a debug message
   * @param {string} message - Message to log
   * @private
   */
  _logDebug(message) {
    if (this.options.debugMode) {
      console.debug(`[EnhancedBaseWorld] ${message}`);
    }
  }
  
  /**
   * Log a warning message
   * @param {string} message - Message to log
   * @private
   */
  _logWarning(message) {
    console.warn(`[EnhancedBaseWorld] ${message}`);
  }
  
  /**
   * Log an error message
   * @param {string} message - Message to log
   * @param {Error} [error] - Error object
   * @private
   */
  _logError(message, error = null) {
    if (error) {
      console.error(`[EnhancedBaseWorld] ${message}`, error);
    } else {
      console.error(`[EnhancedBaseWorld] ${message}`);
    }
  }
  
  /**
   * Get all errors
   * @returns {Array} - Array of errors
   */
  getErrors() {
    return [...this._errors];
  }
  
  /**
   * Get the last error
   * @returns {Object|null} - Last error or null if no errors
   */
  getLastError() {
    return this._lastError;
  }
  
  /**
   * Clear all errors
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  clearErrors() {
    this._errors = [];
    this._lastError = null;
    return this;
  }
  
  /**
   * Set debug mode
   * @param {boolean} enabled - Whether debug mode is enabled
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  setDebugMode(enabled) {
    this.options.debugMode = !!enabled;
    return this;
  }
  
  /**
   * Set safe mode
   * @param {boolean} enabled - Whether safe mode is enabled
   * @returns {EnhancedBaseWorld} - This world for chaining
   */
  setSafeMode(enabled) {
    this.options.safeMode = !!enabled;
    return this;
  }
}

export default EnhancedBaseWorld;