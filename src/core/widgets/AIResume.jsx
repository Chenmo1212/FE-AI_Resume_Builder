import React, { useEffect, useState } from 'react';
import {Table, Button, message, Tag, Space, Spin, Tooltip} from 'antd';
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

  // Debug: Log the steps being received
  console.log("===========OptimizationProgress steps:", steps);

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
            icon = getIcon('check');
            color = 'success';
            break;
          case TASK_STATUS.FAILED:
            icon = getIcon('delete');
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

const SubmitBtn = ({selectedRows, setSelectedRowKeys, setSelectedTasks, resume, messageApi}) => {
  const [isLoading, setLoading] = useState(false);
  const [isPrefer, setIsPrefer] = useState(false);
  const jobs = useJobs((state) => state.jobs);
  const preferResume = usePreferData((state) => state.getResume(), shallow);
  const updateOptimizationSteps = useTasks(state => state.updateOptimizationSteps);

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
      // Create tasks for each selected job
      for (const task of selectedRows) {
        const job = jobs.find((j) => j.id === task.jobId);
        const currentResume = isPrefer ? preferResume : resume;
        
        // Initialize optimization steps tracking
        const initialSteps = {
          [OPTIMIZATION_STEPS.PARSED_JOB]: { status: TASK_STATUS.PENDING },
          [OPTIMIZATION_STEPS.EXPERIENCE]: { status: TASK_STATUS.WAITING },
          [OPTIMIZATION_STEPS.PROJECTS]: { status: TASK_STATUS.WAITING },
          [OPTIMIZATION_STEPS.SKILLS]: { status: TASK_STATUS.WAITING },
          [OPTIMIZATION_STEPS.SUMMARY]: { status: TASK_STATUS.WAITING }
        };
        
        // Update in the store first for immediate UI update
        await updateOptimizationSteps(task.id, initialSteps);
        await taskService.updateTaskStatus(task.id, TASK_STATUS.PROCESSING);
        
        try {
          // Step 1: Parse job description
          const parseJobProcessingSteps = {
            ...task.optimizationSteps,
            [OPTIMIZATION_STEPS.PARSED_JOB]: { status: TASK_STATUS.PROCESSING }
          };
          await updateOptimizationSteps(task.id, parseJobProcessingSteps);


          let parsedJob;
          try {
            parsedJob = await aiService.parseJobDescription(job);
            // Update step status to completed
            const parseJobCompletedSteps = {
              ...task.optimizationSteps,
              [OPTIMIZATION_STEPS.PARSED_JOB]: { status: TASK_STATUS.COMPLETED, result: parsedJob }
            };
            await updateOptimizationSteps(task.id, parseJobCompletedSteps);
          } catch (error) {
            console.log("=========== ParseJobDescription error: ", error);
            const parseJobFailedSteps = {
              ...(task.optimizationSteps || initialSteps),
              [OPTIMIZATION_STEPS.PARSED_JOB]: { status: TASK_STATUS.FAILED, error: error.message }
            };
            await updateOptimizationSteps(task.id, parseJobFailedSteps);
            parsedJob = job.parsedData || {};
            return;
          }
          console.log("=========== End parsing job description ============");

          // Run the remaining steps in parallel
          // Update all steps to processing status
          const processingSteps = {
            ...(task.optimizationSteps || initialSteps),
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
            aiService.optimizeExperiences(job.description, parsedJob, currentResume.work)
              .then(result => {
                const updatedSteps = {
                  ...(task.optimizationSteps || initialSteps),
                  [OPTIMIZATION_STEPS.EXPERIENCE]: { status: TASK_STATUS.COMPLETED, result }
                };
                updateOptimizationSteps(task.id, updatedSteps);
                return result;
              })
              .catch(error => {
                const updatedSteps = {
                  ...(task.optimizationSteps || initialSteps),
                  [OPTIMIZATION_STEPS.EXPERIENCE]: { status: TASK_STATUS.FAILED, error: error.message }
                };
                updateOptimizationSteps(task.id, updatedSteps);
                throw error;
              }),

            // Projects optimization
            aiService.optimizeProjects(job.description, parsedJob, currentResume.projects)
              .then(result => {
                const updatedSteps = {
                  ...(task.optimizationSteps || initialSteps),
                  [OPTIMIZATION_STEPS.PROJECTS]: { status: TASK_STATUS.COMPLETED, result }
                };
                updateOptimizationSteps(task.id, updatedSteps);
                return result;
              })
              .catch(error => {
                const updatedSteps = {
                  ...(task.optimizationSteps || initialSteps),
                  [OPTIMIZATION_STEPS.PROJECTS]: { status: TASK_STATUS.FAILED, error: error.message }
                };
                updateOptimizationSteps(task.id, updatedSteps);
                throw error;
              }),

            // Skills optimization
            aiService.optimizeSkills(job.description, parsedJob, currentResume)
              .then(result => {
                const updatedSteps = {
                  ...(task.optimizationSteps || initialSteps),
                  [OPTIMIZATION_STEPS.SKILLS]: { status: TASK_STATUS.COMPLETED, result }
                };
                updateOptimizationSteps(task.id, updatedSteps);
                return result;
              })
              .catch(error => {
                console.error('Error optimizing skills:', error);
                const updatedSteps = {
                  ...(task.optimizationSteps || initialSteps),
                  [OPTIMIZATION_STEPS.SKILLS]: { status: TASK_STATUS.FAILED, error: error.message }
                };
                updateOptimizationSteps(task.id, updatedSteps);
                throw error;
              }),

            // Summary optimization
            aiService.optimizeSummary(job.description, parsedJob, currentResume)
              .then(result => {
                const updatedSteps = {
                  ...(task.optimizationSteps || initialSteps),
                  [OPTIMIZATION_STEPS.SUMMARY]: { status: TASK_STATUS.COMPLETED, result }
                };
                updateOptimizationSteps(task.id, updatedSteps);
                return result;
              })
              .catch(error => {
                console.error('Error optimizing summary:', error);
                const updatedSteps = {
                  ...(task.optimizationSteps || initialSteps),
                  [OPTIMIZATION_STEPS.SUMMARY]: { status: TASK_STATUS.FAILED, error: error.message }
                };
                updateOptimizationSteps(task.id, updatedSteps);
                throw error;
              })
          ]);

          console.log("============ experienceResult ============", experienceResult);
          console.log("============ projectsResult ============", projectsResult);
          console.log("============ skillsResult ============", skillsResult);
          console.log("============ summaryResult ============", summaryResult);

          // Get results or fallbacks
          const optimizedExperiences = experienceResult.status === 'fulfilled' ? experienceResult.value : currentResume.work;
          const optimizedProjects = projectsResult.status === 'fulfilled' ? projectsResult.value : currentResume.projects;
          const optimizedSkills = skillsResult.status === 'fulfilled' ? skillsResult.value : currentResume.skills;
          const optimizedSummary = summaryResult.status === 'fulfilled' ? summaryResult.value : currentResume.basics?.summary || '';

          // Create the final optimization steps object
          const finalOptimizationSteps = {
            ...(task.optimizationSteps || initialSteps),
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

          console.log("============ finalOptimizationSteps =============", finalOptimizationSteps);

          // Check if all steps are completed
          const allStepsCompleted = Object.entries(finalOptimizationSteps).every(
            ([_, stepStatus]) => {
              return stepStatus.status === TASK_STATUS.COMPLETED || stepStatus.status === TASK_STATUS.FAILED;
            }
          );
          const taskStatus = allStepsCompleted ? TASK_STATUS.COMPLETED : TASK_STATUS.PROCESSING;
          await updateOptimizationSteps(task.id, finalOptimizationSteps);
          await taskService.updateTaskStatus(task.id, taskStatus);

          // Combine all optimized sections into a single resume object
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

          // Add metadata to the optimized resume
          optimizedResume.metadata = {
            jobId: job.id,
            optimizationDate: new Date().toISOString(),
            originalResumeId: currentResume.id || null
          };

          // Store the optimized resume in the resumes store
          const resumeId = await dbService.add(STORES.RESUMES, optimizedResume);
          await taskService.updateTaskStatus(task.id, task.status, {
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
  const [isLoading, setLoading] = useState(false);
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
            return <Tag icon={getIcon('check')} color="success">Completed</Tag>;
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
        console.log("======= record", record);
        // Check if all optimization steps are completed
        const allStepsCompleted = record.optimizationSteps &&
          Object.values(record.optimizationSteps).every(step => step.status === TASK_STATUS.COMPLETED);

        // Check if any optimization steps failed
        const hasFailedSteps = record.optimizationSteps &&
          Object.values(record.optimizationSteps).some(step => step.status === TASK_STATUS.FAILED);

        return (
          <>
            <Space>
              {/* Show View Resume button if task is completed or all steps are completed */}
              <Tooltip title="View Resume">
                <a onClick={() => displayResume(record)}>{getIcon('eye')}</a>
              </Tooltip>
              {/* <a onClick={() => applyStatusHandle(record)} style={{ color: record.isApply ? '#52c41a' : '' }}>{getIcon('apply')}</a> */}
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
      const newResume = await dbService.getById(STORES.RESUMES, record.resumeId);
      if (!newResume) {
        throw new Error('Resume not found in database');
      }
      console.log("====== newResume ======", newResume);
      
      // Update all resume sections
      resetBasics(newResume.basics);
      resetSkills({
        ...resume.skills,
        ...newResume.skills,
      });
      resetWork(newResume.work.map((company) => ({
        ...company,
        // Add * before highlights if they don't start with it
        summary: company.highlights.map(h => h.startsWith('*') ? h : `* ${h}`).join('\n'),
      })));
      resetEducation(newResume.education);
      resetActivities(newResume.activities);
      resetProjects(newResume.projects);
      resetVolunteer(newResume.volunteer);
      resetAwards(newResume.awards);
      
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

  const retryTask = async (record) => {
    if (!record.id) {
      messageApi.open({
        type: 'error',
        content: 'No task ID found!',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get the job data
      const job = jobs.find((j) => j.id === record.jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      // Get the updateOptimizationSteps function from the store
      const updateOptimizationSteps = useTasks.getState().updateOptimizationSteps;
      
      // Check if we have optimization steps
      if (record.optimizationSteps) {
        // Reset only the failed steps to pending
        const updatedSteps = { ...record.optimizationSteps };
        
        Object.keys(updatedSteps).forEach(step => {
          if (updatedSteps[step].status === TASK_STATUS.FAILED) {
            updatedSteps[step].status = TASK_STATUS.PENDING;
            delete updatedSteps[step].error;
          }
        });
        
        // Check if all steps are completed (none are failed or pending)
        const allStepsCompleted = Object.entries(updatedSteps).every(
          ([key, stepStatus]) => {
            // Skip the duplicate parsedJob entry if both exist
            if (key === 'parsedJob' && updatedSteps[OPTIMIZATION_STEPS.PARSED_JOB]) {
              return true;
            }
            return stepStatus.status === TASK_STATUS.COMPLETED;
          }
        );
        
        // Determine the appropriate task status
        const taskStatus = allStepsCompleted ?
          TASK_STATUS.COMPLETED :
          TASK_STATUS.PROCESSING;
        
        // Update in the store first for immediate UI update
        updateOptimizationSteps(record.id, updatedSteps);
        
        // Then update in the database
        await taskService.updateTaskStatus(record.id, taskStatus, {
          optimizationSteps: updatedSteps
        });
        
        messageApi.open({
          type: 'success',
          content: 'Failed steps will be retried. Check the status indicators.'
        });
      } else {
        // Legacy retry for tasks without optimization steps
        await taskService.retryTask(record.id);
        
        // Re-submit to AI service
        await aiService.improveResume(
          record,
          resume,
          job
        );
        
        messageApi.open({
          type: 'success',
          content: 'Task resubmitted successfully!'
        });
      }
      
      // Refresh tasks to update the UI
      fetch();
    } catch (error) {
      console.error('Error retrying task:', error);
      messageApi.open({
        type: 'error',
        content: 'Failed to retry task: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyStatusHandle = async (record) => {
    if (!record.taskId) {
      messageApi.open({
        type: 'error',
        content: 'No task associated with this job!',
      });
      return;
    }

    try {
      await taskService.updateTaskStatus(record.taskId, record.task.status, {
        isApply: !record.isApply,
        applyTime: new Date().toISOString()
      });
      
      messageApi.open({
        type: 'success',
        content: !record.isApply ? 'Successfully applied!' : "Waiting to apply!",
      });
      
      // Refresh jobs to update the UI
      fetch();
    } catch (error) {
      console.error('Error updating apply status:', error);
      messageApi.open({
        type: 'error',
        content: 'Failed to update apply status: ' + error.message,
      });
    }
  };

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