/**
 * IMPORTANT: This file requires the 'idb' package.
 * Please install it using: npm install idb
 * See src/services/INSTALL.md for more details.
 */
import { openDB } from 'idb';

// Database configuration
const DB_NAME = 'resumeBuilderDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  RESUMES: 'resumes',
  JOBS: 'jobs',
  TASKS: 'tasks'
};

/**
 * IndexedDB service for managing database operations
 */
class DBService {
  constructor() {
    this.dbPromise = this.initDB();
  }

  /**
   * Initialize the IndexedDB database
   * @returns {Promise<IDBDatabase>} Database instance
   */
  async initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create resumes store if it doesn't exist
        if (!db.objectStoreNames.contains(STORES.RESUMES)) {
          const resumeStore = db.createObjectStore(STORES.RESUMES, { keyPath: 'id' });
          resumeStore.createIndex('updatedAt', 'updatedAt');
        }

        // Create jobs store if it doesn't exist
        if (!db.objectStoreNames.contains(STORES.JOBS)) {
          const jobStore = db.createObjectStore(STORES.JOBS, { keyPath: 'id' });
          jobStore.createIndex('updatedAt', 'updatedAt');
        }

        // Create tasks store if it doesn't exist
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
          taskStore.createIndex('status', 'status');
          taskStore.createIndex('jobId', 'jobId');
          taskStore.createIndex('createdAt', 'createdAt');
          taskStore.createIndex('updatedAt', 'updatedAt');
        }
      }
    });
  }

  /**
   * Get all items from a store
   * @param {string} storeName - Name of the store
   * @returns {Promise<Array>} Array of items
   */
  async getAll(storeName) {
    const db = await this.dbPromise;
    if (!db) return [];
    
    return db.getAll(storeName);
  }

  /**
   * Get an item by ID
   * @param {string} storeName - Name of the store
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Item data
   */
  async getById(storeName, id) {
    const db = await this.dbPromise;
    if (!db) return null;
    
    return db.get(storeName, id);
  }

  /**
   * Add an item to a store
   * @param {string} storeName - Name of the store
   * @param {Object} item - Item to add
   * @returns {Promise<string>} ID of the added item
   */
  async add(storeName, item) {
    const db = await this.dbPromise;
    if (!db) return null;

    const timestamp = Date.now();

    // Add timestamps if they don't exist
    const itemWithTimestamps = {
      ...item,
      createdAt: item.createdAt || timestamp,
      updatedAt: timestamp
    };

    // Generate ID if not provided
    if (!itemWithTimestamps.id) {
      itemWithTimestamps.id = crypto.randomUUID();
    }
    
    // Remove functions to prevent DataCloneError
    const serializable = this.makeSerializable(itemWithTimestamps);
    
    await db.add(storeName, serializable);
    return serializable.id;
  }

  /**
   * Update an item in a store
   * @param {string} storeName - Name of the store
   * @param {string} id - Item ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated item
   */
  async update(storeName, id, updates) {
    const db = await this.dbPromise;
    if (!db) return null;
    
    const item = await this.getById(storeName, id);
    
    if (!item) {
      throw new Error(`Item with ID ${id} not found in ${storeName}`);
    }
    
    const updatedItem = {
      ...item,
      ...updates,
      updatedAt: Date.now()
    };

    // Remove functions to prevent DataCloneError
    const serializable = this.makeSerializable(updatedItem);
    
    await db.put(storeName, serializable);
    return updatedItem;
  }

  /**
   * Delete an item from a store
   * @param {string} storeName - Name of the store
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */
  async delete(storeName, id) {
    const db = await this.dbPromise;
    if (!db) return;
    
    await db.delete(storeName, id);
  }

  /**
   * Query items by an index
   * @param {string} storeName - Name of the store
   * @param {string} indexName - Name of the index
   * @param {*} value - Value to query
   * @returns {Promise<Array>} Matching items
   */
  async getByIndex(storeName, indexName, value) {
    const db = await this.dbPromise;
    if (!db) return [];
    
    const tx = db.transaction(storeName, 'readonly');
    const index = tx.store.index(indexName);
    return index.getAll(value);
  }

  /**
   * Clear all data from a store
   * @param {string} storeName - Name of the store
   * @returns {Promise<void>}
   */
  async clearStore(storeName) {
    const db = await this.dbPromise;
    if (!db) return;
    
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.clear();
    await tx.done;
  }
  
  /**
   * Make an object serializable by removing functions
   * @param {Object} obj - Object to make serializable
   * @returns {Object} Serializable object
   */
  makeSerializable(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    // Handle primitive types
    if (typeof obj !== 'object') {
      return typeof obj === 'function' ? null : obj;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.makeSerializable(item));
    }
    
    // Handle Date objects
    if (obj instanceof Date) {
      return obj;
    }
    
    // Handle regular objects
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value !== 'function') {
          result[key] = this.makeSerializable(value);
        }
      }
    }
    
    return result;
  }
}

// Export a singleton instance
export const dbService = new DBService();

// Export store names for convenience
export { STORES };
