import React, { useEffect, useMemo, useState } from 'react';
import {Table, Button, message, Tag, Space, Spin, Checkbox} from 'antd';
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
import {Container} from '@mui/material';
import {Heading} from '../components/editor/Editor';
import { useJobs } from '../../stores/jobs.store';

const SubmitBtn = ({selectedRows, setSelectedRowKeys, setSelectedTasks, resume, messageApi}) => {
  const [isLoading, setLoading] = useState(false);
  const [isPrefer, setIsPrefer] = useState(false);
  const jobs = useJobs((state) => state.jobs);
  const preferResume = usePreferData((state) => state.getResume(), shallow);

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
        await aiService.improveResume(
          task,
          isPrefer ? preferResume : resume,
          job,
          messageApi
        );
      }

      messageApi.open({
        type: 'success',
        content: 'Submit task successfully!',
        duration: 0
      });
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
      render: (status) => {
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
      render: (record) => (
        <>
          <Space>
            {record.status === TASK_STATUS.COMPLETED && (
              <a onClick={() => displayResume(record)}>{getIcon('eye')}</a>
            )}
            {record.status === TASK_STATUS.FAILED && (
              <a onClick={() => retryTask(record)}>{getIcon('sync')}</a>
            )}
            <a onClick={() => applyStatusHandle(record)} style={{ color: record.isApply ? '#52c41a' : '' }}>{getIcon('apply')}</a>
          </Space>
        </>
      ),
    },
  ];

  const displayResume = async (record) => {
    // Get the task result from the record
    const taskResult = record.result || (record.task && record.task.result);
    
    if (!taskResult || !taskResult.resumeId) {
      messageApi.open({
        type: 'error',
        content: 'No resume ID available!',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Fetch the resume from the resumes store using the resumeId
      const newResume = await dbService.getById(STORES.RESUMES, taskResult.resumeId);
      
      if (!resume) {
        throw new Error('Resume not found in database');
      }
      
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
    if (!record.taskId) {
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
      
      // Retry the task
      await taskService.retryTask(record.taskId);
      
      // Re-submit to AI service
      await aiService.improveResume(
        record,
        resume,
        job
      );
      
      messageApi.open({
        type: 'success',
        content: 'Task resubmitted successfully!',
      });
      
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
        <Container>
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
        </Container>
      </Spin>
    </>
  );
};