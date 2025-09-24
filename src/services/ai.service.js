import { TASK_STATUS, taskService } from './task.service';
import { dbService, STORES } from './db.service';
import { useJobs } from '../stores/jobs.store';
import { useTasks } from '../stores/tasks.store';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Service for AI resume processing
 */
class AIService {
  constructor() {
    this.serverlessEndpoint = 'https://resume-ai-api-omega.vercel.app';
    this.apiEndpoint = `${this.serverlessEndpoint}/api`;
  }

  /**WW
   * Submit a resume for AI improvement
   * @param {Object} task - Task data
   * @param {Object} resume - Resume data
   * @param {Object} job - Job description
   * @param {Function} messageApi - Callback function
   * @returns {Promise<string>} Task ID
   */
  async improveResume(task, resume, job, messageApi) {
    // Skip processing if not in browser environment
    if (!isBrowser) {
      console.warn('AI service called in non-browser environment');
      return null;
    }
    
    try {
      await taskService.updateTaskStatus(task.id, TASK_STATUS.PROCESSING);

      let parsedJob;
      try {
        // Parse job description
        parsedJob = await this.parseJobDescription(job);
        
        // Store parsed job data in the job object
        await dbService.update(STORES.JOBS, job.id, {
          parsedData: parsedJob
        });
        
        // Only update state if we're in a browser environment
        if (isBrowser && useJobs.getState) {
          const jobsState = useJobs.getState();
          jobsState.update(job.id, 'parsedData', parsedJob);
        }
      } catch (error) {
        console.error('Error parsing job description:', error);
      }

      const optimizationPromises = [
        // Step 2: Optimize work experiences
        this.optimizeExperiences(job.description, parsedJob, resume.work)
          .then(async (optimizedExperiences) => {
            return { experiences: optimizedExperiences };
          })
          .catch(error => {
            console.error('Error optimizing experiences:', error);
            return { experiences: resume.work };
          }),

        // Step 3: Optimize projects
        this.optimizeProjects(job.description, parsedJob, resume.projects)
          .then(async (optimizedProjects) => {
            return { projects: optimizedProjects };
          })
          .catch(error => {
            console.error('Error optimizing projects:', error);
            return { projects: resume.projects };
          }),

        // Step 4: Optimize skills
        this.optimizeSkills(job.description, parsedJob, resume)
          .then(async (optimizedSkills) => {
            return { skills: optimizedSkills };
          })
          .catch(error => {
            console.error('Error optimizing skills:', error);
            return { skills: resume.skills };
          }),

        // Step 5: Optimize summary
        this.optimizeSummary(job.description, parsedJob, resume)
          .then(async (optimizedSummary) => {
            return { summary: optimizedSummary };
          })
          .catch(error => {
            console.error('Error optimizing summary:', error);
            return { summary: resume.basics?.summary || '' };
          })
      ];

      // Wait for all optimization steps to complete
      const optimizationResults = await Promise.all(optimizationPromises);


      // Combine all optimized sections into a single resume object
      const optimizedResume = {
        ...resume,
        work: optimizationResults[0].experiences,
        projects: optimizationResults[1].projects,
        skills: optimizationResults[2].skills,
      };
      
      // Update summary in basics section
      if (optimizationResults[3].summary) {
        optimizedResume.basics = {
          ...optimizedResume.basics,
          summary: optimizationResults[3].summary
        };
      }

      // Add metadata to the optimized resume
      optimizedResume.metadata = {
        jobId: job.id,
        optimizationDate: new Date().toISOString(),
        originalResumeId: resume.id || null
      };

      // Store the optimized resume in the resumes store
      const resumeId = await dbService.add(STORES.RESUMES, optimizedResume);

      // Complete the task with references to the job and resume
      await taskService.completeTask(task.id, {
        resumeId,
        jobId: job.id,
        optimizationDate: new Date().toISOString()
      });
      messageApi.open({
        type: 'success',
        content: `Task '${task.title} finished!'`,
        duration: 0
      });
      return task.id;
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
    // Skip processing if not in browser environment
    if (!isBrowser) {
      console.warn('checkTaskStatus called in non-browser environment');
      return { status: 'error', error: 'Not in browser environment' };
    }
    
    try {
      const response = await fetch(`${this.apiEndpoint}/check-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check task status');
      }

      const data = await response.json();

      // Update task in local database
      if (data.status === TASK_STATUS.COMPLETED) {
        await taskService.completeTask(taskId, data.result);
      } else if (data.status === TASK_STATUS.FAILED) {
        await taskService.failTask(taskId, data.error || 'Task failed');
      } else if (data.status === TASK_STATUS.PROCESSING) {
        await taskService.updateTaskStatus(taskId, TASK_STATUS.PROCESSING, {
          progress: data.progress || 0,
          currentStep: data.currentStep || 'Processing'
        });
      }

      return data;
    } catch (error) {
      console.error('Error checking task status:', error);
      // Don't throw the error here to prevent polling from stopping
      // Just log it and continue
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Optimize work experiences based on job requirements
   * @param {string} jobDescription - Full job description text
   * @param {Object} parsedJob - Parsed job data (alternative to jobDescription)
   * @param {Array} experiences - Array of work experiences
   * @returns {Promise<Array>} Optimized work experiences
   */
  async optimizeExperiences(jobDescription, parsedJob, experiences) {
    try {
      const response = await fetch(`${this.apiEndpoint}/optimize/experiences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobDescription,
          parsedJob,
          experiences
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize experiences');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error optimizing experiences:', error);
      throw error;
    }
  }

  /**
   * Optimize projects based on job requirements
   * @param {string} jobDescription - Full job description text
   * @param {Object} parsedJob - Parsed job data (alternative to jobDescription)
   * @param {Array} projects - Array of projects
   * @returns {Promise<Array>} Optimized projects
   */
  async optimizeProjects(jobDescription, parsedJob, projects) {
    try {
      const response = await fetch(`${this.apiEndpoint}/optimize/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobDescription,
          parsedJob,
          projects
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize projects');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error optimizing projects:', error);
      throw error;
    }
  }

  /**
   * Optimize skills section based on job requirements
   * @param {string} jobDescription - Full job description text
   * @param {Object} parsedJob - Parsed job data (alternative to jobDescription)
   * @param {Object} resume - Resume content
   * @returns {Promise<Array>} Optimized skills
   */
  async optimizeSkills(jobDescription, parsedJob, resume) {
    try {
      const response = await fetch(`${this.apiEndpoint}/optimize/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobDescription,
          parsedJob,
          resume
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize skills');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error optimizing skills:', error);
      throw error;
    }
  }

  /**
   * Create or optimize resume summary based on job requirements
   * @param {string} jobDescription - Full job description text
   * @param {Object} parsedJob - Parsed job data (alternative to jobDescription)
   * @param {Object} resume - Resume content
   * @returns {Promise<Object>} Optimized summary
   */
  async optimizeSummary(jobDescription, parsedJob, resume) {
    try {
      const response = await fetch(`${this.apiEndpoint}/optimize/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobDescription,
          parsedJob,
          resume
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize summary');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error optimizing summary:', error);
      throw error;
    }
  }

  /**
   * Parse job description to extract structured information
   * @param {object} job - Full job description text
   * @returns {Promise<Object>} Parsed job data
   */
  async parseJobDescription(job) {
    try {
      const response = await fetch(`${this.apiEndpoint}/parse-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({job})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse job description');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error parsing job description:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
