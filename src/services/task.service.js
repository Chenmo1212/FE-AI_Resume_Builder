import { dbService, STORES } from './db.service';

// Task status constants
export const TASK_STATUS = {
  WAITING: 'waiting',
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Service for managing AI resume modification tasks
 */
class TaskService {
  constructor() {
    this.pollingIntervals = {}; // Store setInterval IDs for polling
    this.eventListeners = {}; // Store event listeners for task updates
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData) {
    const timestamp = Date.now();
    
    // Create task with default values
    const task = {
      id: window.crypto ? crypto.randomUUID() : `task-${timestamp}`,
      status: TASK_STATUS.WAITING,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
      retryCount: 0,
      error: null,
      ...taskData
    };
    
    // Add to database
    await dbService.add(STORES.TASKS, task);
    
    // Start polling if needed
    if (taskData.requiresPolling) {
      this.startPolling(task.id);
    }
    
    // Emit event
    this.emitEvent('taskCreated', task);
    
    return task;
  }

  /**
   * Get a task by ID
   * @param {string} id - Task ID
   * @returns {Promise<Object>} Task data
   */
  async getTask(id) {
    return dbService.getById(STORES.TASKS, id);
  }

  /**
   * Get all tasks
   * @returns {Promise<Array>} All tasks
   */
  async getAllTasks() {
    return dbService.getAll(STORES.TASKS);
  }

  /**
   * Get tasks by job ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Array>} Tasks for the job
   */
  async getTasksByJobId(jobId) {
    return dbService.getByIndex(STORES.TASKS, 'jobId', jobId);
  }

  /**
   * Get tasks by status
   * @param {string} status - Task status
   * @returns {Promise<Array>} Tasks with the specified status
   */
  async getTasksByStatus(status) {
    return dbService.getByIndex(STORES.TASKS, 'status', status);
  }

  /**
   * Update task status
   * @param {string} id - Task ID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data to update
   * @returns {Promise<Object>} Updated task
   */
  async updateTaskStatus(id, status, additionalData = {}) {
    const task = await this.getTask(id);
    
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    
    const updates = {
      status,
      updatedAt: Date.now(),
      ...additionalData
    };
    
    // Add completedAt timestamp if task is completed
    if (status === TASK_STATUS.COMPLETED) {
      updates.completedAt = Date.now();
      this.stopPolling(id);
    } else if (status === TASK_STATUS.FAILED) {
      this.stopPolling(id);
    }
    
    const updatedTask = await dbService.update(STORES.TASKS, id, updates);
    
    // Emit event
    this.emitEvent('taskUpdated', updatedTask);
    
    return updatedTask;
  }

  /**
   * Mark a task as failed
   * @param {string} id - Task ID
   * @param {string} errorMessage - Error message
   * @returns {Promise<Object>} Updated task
   */
  async failTask(id, errorMessage) {
    return this.updateTaskStatus(id, TASK_STATUS.FAILED, {
      error: errorMessage,
    });
  }

  /**
   * Mark a task as completed
   * @param {string} id - Task ID
   * @param {Object} result - Task result data
   * @returns {Promise<Object>} Updated task
   */
  async completeTask(id, result) {
    return this.updateTaskStatus(id, TASK_STATUS.COMPLETED, {
      result
    });
  }

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {Promise<void>}
   */
  async deleteTask(id) {
    this.stopPolling(id);
    await dbService.delete(STORES.TASKS, id);
    this.emitEvent('taskDeleted', { id });
  }

  /**
   * Start polling for task status updates
   * @param {string} taskId - Task ID
   * @param {number} interval - Polling interval in milliseconds
   */
  startPolling(taskId, interval = 5000) {
    // Clear any existing polling
    this.stopPolling(taskId);
    
    // Set up new polling interval
    this.pollingIntervals[taskId] = setInterval(async () => {
      try {
        const task = await this.getTask(taskId);
        
        if (!task || [TASK_STATUS.COMPLETED, TASK_STATUS.FAILED].includes(task.status)) {
          this.stopPolling(taskId);
          return;
        }
        
        // Here you would call your serverless function to check status
        await this.checkTaskStatusWithServerless(task);
        
      } catch (error) {
        console.error('Error polling task status:', error);
      }
    }, interval);
  }

  /**
   * Stop polling for a task
   * @param {string} taskId - Task ID
   */
  stopPolling(taskId) {
    if (this.pollingIntervals[taskId]) {
      clearInterval(this.pollingIntervals[taskId]);
      delete this.pollingIntervals[taskId];
    }
  }

  /**
   * Clean up old completed tasks
   * @param {number} daysToKeep - Number of days to keep completed tasks
   * @returns {Promise<number>} Number of tasks deleted
   */
  async cleanupOldTasks(daysToKeep = 30) {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    try {
      // Get all completed tasks
      const completedTasks = await this.getTasksByStatus(TASK_STATUS.COMPLETED);
      
      // Delete tasks older than cutoff time
      for (const task of completedTasks) {
        if (task.completedAt && task.completedAt < cutoffTime) {
          await this.deleteTask(task.id);
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old tasks:', error);
      throw error;
    }
  }

  /**
   * Retry a failed task
   * @param {string} id - Task ID
   * @returns {Promise<Object>} Updated task
   */
  async retryTask(id) {
    const task = await this.getTask(id);
    
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    
    if (task.status !== TASK_STATUS.FAILED) {
      throw new Error(`Cannot retry task that is not in failed state`);
    }
    
    const updates = {
      status: TASK_STATUS.PENDING,
      error: null,
      retryCount: (task.retryCount || 0) + 1,
      updatedAt: Date.now()
    };
    
    const updatedTask = await dbService.update(STORES.TASKS, id, updates);
    
    // Start polling again
    this.startPolling(id);
    
    // Emit event
    this.emitEvent('taskRetried', updatedTask);
    
    return updatedTask;
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emitEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  }
}

// Export a singleton instance
export const taskService = new TaskService();
