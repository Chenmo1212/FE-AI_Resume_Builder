/**
 * IMPORTANT: This file requires the 'idb' package.
 * Please install it using: npm install idb
 * See src/services/INSTALL.md for more details.
 */
import { openDB } from 'idb';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined' && window.indexedDB;

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
    if (isBrowser) {
      this.dbPromise = this.initDB();
    } else {
      // Create a mock promise that resolves to null when not in browser
      this.dbPromise = Promise.resolve(null);
    }
  }

  /**
   * Initialize the IndexedDB database
   * @returns {Promise<IDBDatabase>} Database instance
   */
  async initDB() {
    if (!isBrowser) return null;
    
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
    if (!isBrowser) return [];
    
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
    if (!isBrowser) return null;
    
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
    if (!isBrowser) return null;
    
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
    
    await db.add(storeName, itemWithTimestamps);
    return itemWithTimestamps.id;
  }

  /**
   * Update an item in a store
   * @param {string} storeName - Name of the store
   * @param {string} id - Item ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated item
   */
  async update(storeName, id, updates) {
    if (!isBrowser) return null;
    
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
    
    await db.put(storeName, updatedItem);
    return updatedItem;
  }

  /**
   * Delete an item from a store
   * @param {string} storeName - Name of the store
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */
  async delete(storeName, id) {
    if (!isBrowser) return;
    
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
    if (!isBrowser) return [];
    
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
    if (!isBrowser) return;
    
    const db = await this.dbPromise;
    if (!db) return;
    
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.clear();
    await tx.done;
  }
}

// Export a singleton instance
export const dbService = new DBService();

// Export store names for convenience
export { STORES };

// Made with Bob
