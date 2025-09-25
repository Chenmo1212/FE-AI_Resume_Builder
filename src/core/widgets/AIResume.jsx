import React, { useEffect, useState } from 'react';
import {Table, Button, message, Tag, Space, Spin, Tooltip} from 'antd';
import ResumeComparisonModal from '../components/resume/ResumeComparisonModal';
import {useTasks} from '../../stores/tasks.store';
import { TASK_STATUS, taskService } from '../../services/task.service';
import { dbService, STORES } from '../../services/db.service';
import {aiService} from '../../services/ai.service';
import shallow from 'zustand/shallow';
import {
  useActivities,
  useAwards,
  useEducation,
  useIntro, usePreferData,
  useProjects,
  useSkills,
  useVolunteer,
  useWork,
} from '../../stores/data.store';
import {getIcon} from '../../styles/icons';
import {Heading} from '../components/editor/Editor';
import { useJobs } from '../../stores/jobs.store';

// Define the optimization steps
const OPTIMIZATION_STEPS = {
  PARSED_JOB: 'parsedJob',
  EXPERIENCE: 'experience',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  SUMMARY: 'summary'
};

// Component to display optimization progress with status icons
const OptimizationProgress = ({ steps, taskId, messageApi, resume, job }) => {
  const updateOptimizationSteps = useTasks(state => state.updateOptimizationSteps);
  
  // Define appropriate icons for each step
  const stepIcons = {
    [OPTIMIZATION_STEPS.PARSED_JOB]: 'search',
    [OPTIMIZATION_STEPS.EXPERIENCE]: 'work',
    [OPTIMIZATION_STEPS.PROJECTS]: 'branch',
    [OPTIMIZATION_STEPS.SKILLS]: 'skill',
    [OPTIMIZATION_STEPS.SUMMARY]: 'identity'
  };

  // Function to retry a specific optimization step
  const retryStep = async (step) => {
    try {
      messageApi.open({
        type: 'loading',
        content: `Retrying ${step} optimization...`,
        duration: 0,
      });

      // Call the appropriate optimization function based on the step
      let result;
      console.log("Retrying step:", step);
      switch (step) {
        case OPTIMIZATION_STEPS.PARSED_JOB:
        case 'parsedJob': // Handle both the constant and the string value
          result = await aiService.parseJobDescription(job);
          // Update job with new parsed data
          await dbService.update(STORES.JOBS, job.id, {
            parsedData: result
          });
          break;
        case OPTIMIZATION_STEPS.EXPERIENCE:
          result = await aiService.optimizeExperiences(job.description, job.parsedData, resume.work);
          break;
        case OPTIMIZATION_STEPS.PROJECTS:
          result = await aiService.optimizeProjects(job.description, job.parsedData, resume.projects);
          break;
        case OPTIMIZATION_STEPS.SKILLS:
          result = await aiService.optimizeSkills(job.description, job.parsedData, resume);
          break;
        case OPTIMIZATION_STEPS.SUMMARY:
          result = await aiService.optimizeSummary(job.description, job.parsedData, resume);
          break;
        default:
          throw new Error('Unknown optimization step');
      }

      // Update the task with the new step status
      const updatedSteps = { ...steps, [step]: { status: TASK_STATUS.COMPLETED, result } };
      
      // Update in the store first for immediate UI update
      console.log("Updating steps in retryStep:", updatedSteps);
      updateOptimizationSteps(taskId, updatedSteps);
      
      // Check if all steps are now completed
      const allStepsCompleted = Object.entries(updatedSteps).every(
        ([key, stepStatus]) => {
          // Skip the duplicate parsedJob entry if both exist
          if (key === 'parsedJob' && updatedSteps[OPTIMIZATION_STEPS.PARSED_JOB]) {
            return true;
          }
          return stepStatus.status === TASK_STATUS.COMPLETED;
        }
      );
      
      // If all steps are completed, update the overall task status to COMPLETED
      if (allStepsCompleted) {
        await taskService.updateTaskStatus(taskId, TASK_STATUS.COMPLETED, {
          optimizationSteps: updatedSteps
        });
      } else {
        // Otherwise keep it as PROCESSING
        await taskService.updateTaskStatus(taskId, TASK_STATUS.PROCESSING, {
          optimizationSteps: updatedSteps
        });
      }

      messageApi.open({
        type: 'success',
        content: `${step} optimization completed!`,
        duration: 2,
      });

      // Refresh tasks to update UI
      useTasks.getState().fetch();
    } catch (error) {
      console.error(`Error retrying ${step} optimization:`, error);
      messageApi.open({
        type: 'error',
        content: `Failed to optimize ${step}: ${error.message}`,
        duration: 4,
      });

      // Update the task with the failed step status
      const updatedSteps = { ...steps, [step]: { status: TASK_STATUS.FAILED, error: error.message } };
      
      // Update in the store first for immediate UI update
      updateOptimizationSteps(taskId, updatedSteps);
      
      // Then update in the database
      await taskService.updateTaskStatus(taskId, TASK_STATUS.PROCESSING, {
        optimizationSteps: updatedSteps
      });

      // Refresh tasks to update UI
      useTasks.getState().fetch();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {Object.entries(stepIcons).map(([step, iconName]) => {
        const stepStatus = steps[step]?.status || TASK_STATUS.WAITING;
        let icon, color;
        
        switch (stepStatus) {
          case TASK_STATUS.WAITING:
            icon = getIcon(iconName);
            color = 'default';
            break;
          case TASK_STATUS.PENDING:
            icon = getIcon('clock');
            color = 'default';
            break;
          case TASK_STATUS.PROCESSING:
            icon = getIcon('sync');
            color = 'processing';
            break;
          case TASK_STATUS.COMPLETED:
            icon = getIcon(iconName);
            color = 'success';
            break;
          case TASK_STATUS.FAILED:
            icon = getIcon(iconName);
            color = 'error';
            break;
          default:
            icon = getIcon(iconName);
            color = 'default';
        }

        return (
          <Tooltip key={step} title={`${step}: ${stepStatus}`}>
            <Tag
              icon={icon}
              color={color}
              style={{
                cursor: stepStatus === TASK_STATUS.FAILED ? 'pointer' : 'default',
                marginRight: 0
              }}
              onClick={stepStatus === TASK_STATUS.FAILED ? () => retryStep(step) : undefined}
            />
          </Tooltip>
        );
      })}
    </div>
  );
};

// Utility functions for resume optimization
const resumeOptimizationUtils = {
  // Initialize optimization steps tracking
  initializeSteps: () => ({
    [OPTIMIZATION_STEPS.PARSED_JOB]: { status: TASK_STATUS.PENDING },
    [OPTIMIZATION_STEPS.EXPERIENCE]: { status: TASK_STATUS.WAITING },
    [OPTIMIZATION_STEPS.PROJECTS]: { status: TASK_STATUS.WAITING },
    [OPTIMIZATION_STEPS.SKILLS]: { status: TASK_STATUS.WAITING },
    [OPTIMIZATION_STEPS.SUMMARY]: { status: TASK_STATUS.WAITING }
  }),

  // Check if all steps are completed or failed
  areAllStepsFinished: (steps) => {
    return Object.entries(steps).every(
      ([_, stepStatus]) => stepStatus.status === TASK_STATUS.COMPLETED || stepStatus.status === TASK_STATUS.FAILED
    );
  },

  // Create optimized resume object from results
  createOptimizedResume: (currentResume, optimizedData) => {
    const { optimizedExperiences, optimizedProjects, optimizedSkills, optimizedSummary } = optimizedData;
    
    // Create the optimized resume object
    const optimizedResume = {
      ...currentResume,
      work: optimizedExperiences,
      projects: optimizedProjects,
      skills: optimizedSkills,
    };

    // Update summary in basics section
    if (optimizedSummary) {
      optimizedResume.basics = {
        ...optimizedResume.basics,
        summary: optimizedSummary
      };
    }
    
    return optimizedResume;
  }
};

const SubmitBtn = ({selectedRows, setSelectedRowKeys, setSelectedTasks, resume, messageApi}) => {
  const [isLoading, setLoading] = useState(false);
  const [isPrefer, setIsPrefer] = useState(false);
  const jobs = useJobs((state) => state.jobs);
  const updateTask = useTasks((state) => state.update, shallow);
  const preferResume = usePreferData((state) => state.getResume(), shallow);
  const updateOptimizationSteps = useTasks(state => state.updateOptimizationSteps);

  // Parse job description
  const parseJobDescription = async (job, task, steps) => {
    try {
      // Update step status to processing
      const updatedSteps = {
        ...steps,
        [OPTIMIZATION_STEPS.PARSED_JOB]: { status: TASK_STATUS.PROCESSING }
      };
      await updateOptimizationSteps(task.id, updatedSteps);

      // Parse job description
      const parsedJob = await aiService.parseJobDescription(job);
      
      // Update step status to completed
      const completedSteps = {
        ...updatedSteps,
        [OPTIMIZATION_STEPS.PARSED_JOB]: { status: TASK_STATUS.COMPLETED, result: parsedJob }
      };
      await updateOptimizationSteps(task.id, completedSteps);
      
      return { parsedJob, steps: completedSteps };
    } catch (error) {
      // Update step status to failed
      const failedSteps = {
        ...steps,
        [OPTIMIZATION_STEPS.PARSED_JOB]: { status: TASK_STATUS.FAILED, error: error.message }
      };
      await updateOptimizationSteps(task.id, failedSteps);
      
      // Use existing parsed data as fallback
      return { parsedJob: job.parsedData || {}, steps: failedSteps, error };
    }
  };

  // Run optimization steps in parallel
  const runOptimizationSteps = async (job, parsedJob, currentResume, task, steps) => {
    // Update all steps to processing status
    const processingSteps = {
      ...steps,
      [OPTIMIZATION_STEPS.EXPERIENCE]: { status: TASK_STATUS.PROCESSING },
      [OPTIMIZATION_STEPS.PROJECTS]: { status: TASK_STATUS.PROCESSING },
      [OPTIMIZATION_STEPS.SKILLS]: { status: TASK_STATUS.PROCESSING },
      [OPTIMIZATION_STEPS.SUMMARY]: { status: TASK_STATUS.PROCESSING }
    };
    await updateOptimizationSteps(task.id, processingSteps);
    
    // Run all optimization steps in parallel
    const [
      experienceResult,
      projectsResult,
      skillsResult,
      summaryResult
    ] = await Promise.allSettled([
      // Experience optimization
      aiService.optimizeExperiences(job.description, parsedJob, currentResume.work)
        .then(result => {
          const updatedSteps = {
            ...steps,
            [OPTIMIZATION_STEPS.EXPERIENCE]: { status: TASK_STATUS.COMPLETED, result }
          };
          updateOptimizationSteps(task.id, updatedSteps);
          return result;
        })
        .catch(error => {
          const updatedSteps = {
            ...steps,
            [OPTIMIZATION_STEPS.EXPERIENCE]: { status: TASK_STATUS.FAILED, error: error.message }
          };
          updateOptimizationSteps(task.id, updatedSteps);
          throw error;
        }),

      // Projects optimization
      aiService.optimizeProjects(job.description, parsedJob, currentResume.projects)
        .then(result => {
          const updatedSteps = {
            ...steps,
            [OPTIMIZATION_STEPS.PROJECTS]: { status: TASK_STATUS.COMPLETED, result }
          };
          updateOptimizationSteps(task.id, updatedSteps);
          return result;
        })
        .catch(error => {
          const updatedSteps = {
            ...steps,
            [OPTIMIZATION_STEPS.PROJECTS]: { status: TASK_STATUS.FAILED, error: error.message }
          };
          updateOptimizationSteps(task.id, updatedSteps);
          throw error;
        }),

      // Skills optimization
      aiService.optimizeSkills(job.description, parsedJob, currentResume)
        .then(result => {
          const updatedSteps = {
            ...steps,
            [OPTIMIZATION_STEPS.SKILLS]: { status: TASK_STATUS.COMPLETED, result }
          };
          updateOptimizationSteps(task.id, updatedSteps);
          return result;
        })
        .catch(error => {
          const updatedSteps = {
            ...steps,
            [OPTIMIZATION_STEPS.SKILLS]: { status: TASK_STATUS.FAILED, error: error.message }
          };
          updateOptimizationSteps(task.id, updatedSteps);
          throw error;
        }),

      // Summary optimization
      aiService.optimizeSummary(job.description, parsedJob, currentResume)
        .then(result => {
          const updatedSteps = {
            ...(task.optimizationSteps || steps),
            [OPTIMIZATION_STEPS.SUMMARY]: { status: TASK_STATUS.COMPLETED, result }
          };
          updateOptimizationSteps(task.id, updatedSteps);
          return result;
        })
        .catch(error => {
          const updatedSteps = {
            ...steps,
            [OPTIMIZATION_STEPS.SUMMARY]: { status: TASK_STATUS.FAILED, error: error.message }
          };
          updateOptimizationSteps(task.id, updatedSteps);
          throw error;
        })
    ]);
    
    // Get results or fallbacks
    const optimizedExperiences = experienceResult.status === 'fulfilled' ? experienceResult.value : currentResume.work;
    const optimizedProjects = projectsResult.status === 'fulfilled' ? projectsResult.value : currentResume.projects;
    const optimizedSkills = skillsResult.status === 'fulfilled' ? skillsResult.value : currentResume.skills;
    const optimizedSummary = summaryResult.status === 'fulfilled' ? summaryResult.value : currentResume.basics?.summary || '';
    
    // Create the final optimization steps object
    const finalSteps = {
      ...steps,
      [OPTIMIZATION_STEPS.EXPERIENCE]: {
        status: experienceResult.status === 'fulfilled' ? TASK_STATUS.COMPLETED : TASK_STATUS.FAILED,
        ...(experienceResult.status === 'fulfilled' ? { result: optimizedExperiences } : { error: experienceResult.reason?.message })
      },
      [OPTIMIZATION_STEPS.PROJECTS]: {
        status: projectsResult.status === 'fulfilled' ? TASK_STATUS.COMPLETED : TASK_STATUS.FAILED,
        ...(projectsResult.status === 'fulfilled' ? { result: optimizedProjects } : { error: projectsResult.reason?.message })
      },
      [OPTIMIZATION_STEPS.SKILLS]: {
        status: skillsResult.status === 'fulfilled' ? TASK_STATUS.COMPLETED : TASK_STATUS.FAILED,
        ...(skillsResult.status === 'fulfilled' ? { result: optimizedSkills } : { error: skillsResult.reason?.message })
      },
      [OPTIMIZATION_STEPS.SUMMARY]: {
        status: summaryResult.status === 'fulfilled' ? TASK_STATUS.COMPLETED : TASK_STATUS.FAILED,
        ...(summaryResult.status === 'fulfilled' ? { result: optimizedSummary } : { error: summaryResult.reason?.message })
      }
    };
    
    await updateOptimizationSteps(task.id, finalSteps);
    
    return { 
      steps: finalSteps,
      optimizedData: {
        optimizedExperiences,
        optimizedProjects,
        optimizedSkills,
        optimizedSummary
      }
    };
  };

  // Process a single task
  const processTask = async (task) => {
    const job = jobs.find((j) => j.id === task.jobId);
    const currentResume = isPrefer ? preferResume : resume;
    
    // Initialize optimization steps tracking
    let steps = resumeOptimizationUtils.initializeSteps();
    
    // Update in the store first for immediate UI update
    await updateOptimizationSteps(task.id, steps);
    await taskService.updateTaskStatus(task.id, TASK_STATUS.PROCESSING);
    
    try {
      // Step 1: Parse job description
      const { parsedJob, steps: updatedSteps, error } = await parseJobDescription(job, task, steps);
      
      // If parsing failed, stop the process
      if (error) return;
      
      steps = updatedSteps;
      
      // Step 2: Run optimization steps in parallel
      const { steps: finalSteps, optimizedData } = await runOptimizationSteps(
        job, parsedJob, currentResume, task, steps
      );
      
      steps = finalSteps;
      
      // Step 3: Check if all steps are completed
      const allStepsCompleted = resumeOptimizationUtils.areAllStepsFinished(steps);
      const taskStatus = allStepsCompleted ? TASK_STATUS.COMPLETED : TASK_STATUS.PROCESSING;
      
      // Step 4: Create optimized resume
      const optimizedResume = resumeOptimizationUtils.createOptimizedResume(currentResume, optimizedData);
      
      // Step 5: Add metadata to the optimized resume
      optimizedResume.metadata = {
        jobId: job.id,
        optimizationDate: new Date().toISOString(),
        originalResumeId: currentResume.id || null
      };
      
      // Step 6: Store the optimized resume
      const resumeId = await dbService.add(STORES.RESUMES, optimizedResume);
      await updateTask(task.id, 'resumeId', resumeId);
      await taskService.updateTaskStatus(task.id, taskStatus, {
        resumeId: resumeId,
      });
      
      messageApi.open({
        type: 'success',
        content: `Task ${task.title} finished!`,
        duration: 0
      });
    } catch (error) {
      console.error('Error in resume optimization process:', error);
      await taskService.failTask(task.id, error.message);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!selectedRows.length) {
      messageApi.open({
        type: 'error',
        content: 'Please select a job!',
      });
      setLoading(false);
      return;
    }

    try {
      // Process each selected task
      for (const task of selectedRows) {
        await processTask(task);
      }
      setSelectedRowKeys([]);
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error submitting tasks:', error);
      messageApi.open({
        type: 'error',
        content: 'Failed to submit tasks: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = () => {
    // No need to check status for jobs
    return false;
  };

  const onPreferChange = (e) => {
    setIsPrefer(e.target.checked);
  };

  return (
    <>
      {/*<Checkbox onChange={onPreferChange} style={{color: "#fff"}} checked={isPrefer}>Use Prefer Resume</Checkbox>*/}
      <Button type="primary" onClick={handleSubmit} disabled={handleStatus()} loading={isLoading}>
        Submit
      </Button>
    </>
  );
};

const TaskTable = ({selectedRowKeys, onSelectedRowsChange, setSelectedRowKeys, messageApi, resume}) => {
  const [tasks] = useTasks((state) => [state.tasks]);
  const [updateTask] = useTasks((state) => [state.update]);
  const [isLoading, setLoading] = useState(false);
  const [isComparisonModalVisible, setComparisonModalVisible] = useState(false);
  const [currentOptimizedResume, setCurrentOptimizedResume] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const fetch = useTasks((state) => state.fetch, shallow);
  const jobs = useJobs((state) => state.jobs);
  const resetBasics = useIntro((state) => state.reset);
  const resetSkills = useSkills((state) => state.reset);
  const resetWork = useWork((state) => state.reset);
  const resetEducation = useEducation((state) => state.reset);
  const resetActivities = useActivities((state) => state.reset);
  const resetProjects = useProjects((state) => state.reset);
  const resetVolunteer = useVolunteer((state) => state.reset);
  const resetAwards = useAwards((state) => state.reset);

  useEffect(() => {
    fetch();
  }, []);

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      onSelectedRowsChange(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status >= 0,
    }),
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, record) => (
        <>
          <a href={record.link} target="_blank" rel="noreferrer">
            {title}
          </a>
        </>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status, record) => {
        // If the task has optimization steps, show the progress component
        if (record.optimizationSteps) {
          // Check if all steps are completed
          const allStepsCompleted = Object.entries(record.optimizationSteps).every(
            ([_, step]) => {
              return step.status === TASK_STATUS.COMPLETED || step.status === TASK_STATUS.FAILED;
            }
          );
          
          // If all steps are completed, show a success tag
          if (allStepsCompleted) {
            return <Tag icon={getIcon('check')} color="success"/>;
          }
          
          // Otherwise show the progress component
          return <OptimizationProgress
            steps={record.optimizationSteps}
            taskId={record.id}
            messageApi={messageApi}
            resume={resume}
            job={jobs.find(j => j.id === record.jobId)}
          />;
        }
        
        // Otherwise show the traditional status indicators
        if (status === TASK_STATUS.WAITING) return <Tag icon={getIcon('cloud')} color="default"/>;
        else if (status === TASK_STATUS.PENDING) return <Tag icon={getIcon('clock')} color="default"/>;
        else if (status === TASK_STATUS.PROCESSING) return <Tag icon={getIcon('sync')} color="processing"/>;
        else if (status === TASK_STATUS.COMPLETED) return <Tag icon={getIcon('check')} color="success"/>;
      },
      filters: [
        {
          text: 'Default',
          value: TASK_STATUS.WAITING,
        },
        {
          text: 'Waiting',
          value: TASK_STATUS.PENDING,
        },
        {
          text: 'Processing',
          value: TASK_STATUS.PROCESSING,
        },
        {
          text: 'Success',
          value: TASK_STATUS.COMPLETED,
        },
        {
          text: 'Failed',
          value: TASK_STATUS.FAILED,
        },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Action',
      render: (record) => {
        // Check if all optimization steps are completed
        const allStepsCompleted = record.optimizationSteps &&
          Object.values(record.optimizationSteps).every(step => step.status === TASK_STATUS.COMPLETED);

        // Check if any optimization steps failed
        const hasFailedSteps = record.optimizationSteps &&
          Object.values(record.optimizationSteps).some(step => step.status === TASK_STATUS.FAILED);

        return (
          <>
            <Space>
              {allStepsCompleted || hasFailedSteps ? (
                <>
                  <Tooltip title="View Resume">
                    <a onClick={() => displayResume(record)}>{getIcon('eye')}</a>
                  </Tooltip>
                  <Tooltip title="Compare Changes">
                    <a onClick={() => compareResume(record)}>{getIcon('diff')}</a>
                  </Tooltip>
                </>
              ) : ""}
              <Tooltip title="Reset Task">
                <a onClick={() => resetTask(record)}>{getIcon('reset')}</a>
              </Tooltip>
            </Space>
          </>
        );
      },
    },
  ];

  const displayResume = async (record) => {
    console.log("====== displayResume ======", record);
    try {
      setLoading(true);
      // Fetch the resume from the resumes store using the resumeId
      const optimizedResume = await dbService.getById(STORES.RESUMES, record.resumeId);
      if (!optimizedResume) {
        throw new Error('Resume not found in database');
      }
      console.log("====== optimizedResume ======", optimizedResume);
      
      // Directly apply the optimized resume
      resetBasics(optimizedResume.basics);
      resetSkills({
        ...resume.skills,
        ...optimizedResume.skills,
      });
      resetWork(optimizedResume.work.map((company) => ({
        ...company,
        // Add * before highlights if they don't start with it
        summary: company.highlights.map(h => h.startsWith('*') ? h : `* ${h}`).join('\n'),
      })));
      resetEducation(optimizedResume.education);
      resetActivities(optimizedResume.activities);
      resetProjects(optimizedResume.projects);
      resetVolunteer(optimizedResume.volunteer);
      resetAwards(optimizedResume.awards);
      
      messageApi.open({
        type: 'success',
        content: 'Resume loaded successfully!',
      });
    } catch (error) {
      console.error('Error loading resume:', error);
      messageApi.open({
        type: 'error',
        content: 'Failed to load resume: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to compare the original resume with the optimized resume
  const compareResume = async (record) => {
    console.log("====== compareResume ======", record);
    try {
      setLoading(true);
      // Fetch the resume from the resumes store using the resumeId
      const optimizedResume = await dbService.getById(STORES.RESUMES, record.resumeId);
      if (!optimizedResume) {
        throw new Error('Resume not found in database');
      }
      console.log("====== optimizedResume for comparison ======", optimizedResume);
      
      // Store the current record and optimized resume for the modal
      setCurrentRecord(record);
      setCurrentOptimizedResume(optimizedResume);
      
      // Show the comparison modal
      console.log("Setting modal visible to true");
      setComparisonModalVisible(true);
      console.log("Modal visibility state after setting:", true);
    } catch (error) {
      console.error('Error loading resume for comparison:', error);
      messageApi.open({
        type: 'error',
        content: 'Failed to load resume for comparison: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to apply the optimized resume after user confirms in the modal
  const applyOptimizedResume = (selectedOptimizations) => {
    try {
      // Apply selected optimizations to the resume
      if (selectedOptimizations.basics) {
        resetBasics(selectedOptimizations.basics);
      }
      
      if (selectedOptimizations.skills) {
        resetSkills({
          ...resume.skills,
          ...selectedOptimizations.skills,
        });
      }
      
      if (selectedOptimizations.work) {
        resetWork(selectedOptimizations.work.map((company) => ({
          ...company,
          // Add * before highlights if they don't start with it
          summary: company.highlights.map(h => h.startsWith('*') ? h : `* ${h}`).join('\n'),
        })));
      }
      
      if (selectedOptimizations.projects) {
        resetProjects(selectedOptimizations.projects);
      }
      
      if (selectedOptimizations.education) {
        resetEducation(selectedOptimizations.education);
      }
      
      if (selectedOptimizations.activities) {
        resetActivities(selectedOptimizations.activities);
      }
      
      if (selectedOptimizations.volunteer) {
        resetVolunteer(selectedOptimizations.volunteer);
      }
      
      if (selectedOptimizations.awards) {
        resetAwards(selectedOptimizations.awards);
      }
      
      // Close the modal
      setComparisonModalVisible(false);
      setCurrentOptimizedResume(null);
      setCurrentRecord(null);
      
      messageApi.open({
        type: 'success',
        content: 'Resume optimizations applied successfully!',
      });
    } catch (error) {
      console.error('Error applying optimized resume:', error);
      messageApi.open({
        type: 'error',
        content: 'Failed to apply optimizations: ' + error.message,
      });
    }
  };

  const resetTask = async (record) => {
    await updateTask(record.id, "optimizationSteps", null);
    await updateTask(record.id, "resumeId", null);
    await updateTask(record.id, "status", TASK_STATUS.PENDING);

    await dbService.update(STORES.TASKS, record.id, {
      resumeId: null,
      status: TASK_STATUS.PENDING
    });
  }

  console.log("TaskTable render - Modal visibility:", isComparisonModalVisible);
  console.log("TaskTable render - Current optimized resume:", currentOptimizedResume);
  
  return (
    <div>
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        columns={columns}
        dataSource={tasks}
        loading={isLoading}
      />
      
      {/* Resume Comparison Modal */}
      <ResumeComparisonModal
        visible={isComparisonModalVisible}
        onCancel={() => {
          setComparisonModalVisible(false);
          setCurrentOptimizedResume(null);
          setCurrentRecord(null);
        }}
        onApply={applyOptimizedResume}
        originalResume={resume}
        optimizedResume={currentOptimizedResume}
      />
    </div>
  );
};

export const AIResume = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const basics = useIntro((state) => state.intro);
  const skills = useSkills((state) => state);
  const work = useWork((state) => state.companies);
  const education = useEducation((state) => state.education);
  const activities = useActivities((state) => state);
  const projects = useProjects((state) => state.projects);
  const volunteer = useVolunteer((state) => state.volunteer);
  const awards = useAwards((state) => state.awards);
  const loading = useTasks((state) => state.loading);
  
  const resume = {
    basics,
    skills,
    work,
    education,
    projects,
    activities,
    volunteer,
    awards,
  };

  return (
    <>
      <Spin spinning={loading} tip="Loading...">
        <div>
          {contextHolder}
          <Heading>AI Resume</Heading>
          <TaskTable
            selectedRowKeys={selectedRowKeys}
            onSelectedRowsChange={(selectedTasks) => setSelectedTasks(selectedTasks)}
            setSelectedRowKeys={setSelectedRowKeys}
            messageApi={messageApi}
            resume={resume}
          />
          <SubmitBtn
            selectedRows={selectedTasks}
            setSelectedRowKeys={setSelectedRowKeys}
            setSelectedTasks={setSelectedTasks}
            resume={resume}
            messageApi={messageApi}
          />
        </div>
      </Spin>
    </>
  );
};