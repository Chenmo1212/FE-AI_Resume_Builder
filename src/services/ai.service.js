import { TASK_STATUS, taskService } from './task.service';

/**
 * Service for AI resume processing
 */
class AIService {
  constructor() {
    this.serverlessEndpoint = 'https://resume-ai-api-omega.vercel.app';
  }

  /**
   * Submit a resume for AI improvement
   * @param {Object} task - Task data
   * @param {Object} resume - Resume data
   * @param {Object} job - Job description
   * @returns {Promise<string>} Task ID
   */
  async improveResume(task, resume, job) {
    try {
      // Update task status in the local database
      await taskService.updateTaskStatus(task.id, TASK_STATUS.PROCESSING);

      // // Call the serverless function to start processing
      // const response = await fetch(`${this.serverlessEndpoint}/optimize`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     taskId: task.id,
      //     resume,
      //     jobDescription
      //   })
      // });
      //
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to submit resume for AI processing');
      // }
      
      // Start polling for updates
      // taskService.startPolling(task.id);
      
      // return task.id;
      return '1111';
    } catch (error) {
      console.error('Error submitting resume for AI improvement:', error);
      throw error;
    }
  }

  /**
   * Check the status of an AI processing task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Task status
   */
  async checkTaskStatus(taskId) {
    console.log("======== Checking task status ========")
  }
  //   try {
  //     const response = await fetch(`${this.serverlessEndpoint}/check-status`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ taskId })
  //     });
  //
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to check task status');
  //     }
  //
  //     const data = await response.json();
  //
  //     // Update task in local database
  //     if (data.status === 'completed') {
  //       await taskService.completeTask(taskId, data.result);
  //     } else if (data.status === 'failed') {
  //       await taskService.failTask(taskId, data.error || 'Task failed');
  //     } else {
  //       await taskService.updateTaskProgress(taskId, data.progress);
  //     }
  //
  //     return data;
  //   } catch (error) {
  //     console.error('Error checking task status:', error);
  //     throw error;
  //   }
  // }
}

// Export a singleton instance
export const aiService = new AIService();
