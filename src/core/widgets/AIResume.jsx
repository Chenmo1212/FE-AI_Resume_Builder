import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, message, Tag, Space, Spin,
  Tooltip, Dropdown, Menu, Alert, Popconfirm,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useTasks, useJobs } from '../../stores/jobs.store';
import shallow from 'zustand/shallow';
import {
  useActivities, useAwards, useEducation, useIntro,
  usePreferData, useProjects, useSkills, useVolunteer, useWork,
} from '../../stores/data.store';
import { updateTask, checkHealth } from '../../axios/api';
import { getIcon } from '../../styles/icons';
import { useAIStore } from '../../stores/ai.store';
import { JobModal } from './JobModal';
import { Container } from '@mui/material';
import { Heading } from '../components/editor/Editor';
import styled from 'styled-components';

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Divider = styled.div`
  height: 2px;
  background: white;
  margin: 20px 0;
`;

const ConfigSection = styled.div`
  margin: 8px 0;
`;

const ConfigTopic = styled.p`
  font-weight: 600;
  color: #fff;
  margin-bottom: 7px;
  font-size: 0.875rem;
`;

const ConfigRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #333;
`;

const darkAlertStyle = {
  background: 'rgba(255, 193, 7, 0.08)',
  border: '1px solid rgba(255, 193, 7, 0.3)',
  marginBottom: 12,
};

const DarkTable = styled(Table)`
  && {
    .ant-table,
    .ant-table-container,
    .ant-table-content,
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td,
    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover,
    .ant-table-cell {
      background: transparent !important;
      color: #e6e6e6 !important;
      border-color: #444 !important;
    }
    .ant-table-thead > tr > th {
      color: #aaa !important;
      background: transparent !important;
      border-bottom: 1px solid #444 !important;
    }
    .ant-table-tbody > tr > td {
      border-bottom: 1px solid #333 !important;
    }
    .ant-table-tbody > tr:hover > td {
      background: rgba(255, 255, 255, 0.05) !important;
    }
    .ant-pagination-item,
    .ant-pagination-prev .ant-pagination-item-link,
    .ant-pagination-next .ant-pagination-item-link {
      background: transparent !important;
      border-color: #444 !important;
      color: #aaa !important;
    }
    .ant-pagination-item a,
    .ant-pagination-prev button,
    .ant-pagination-next button {
      color: #aaa !important;
    }
    .ant-pagination-item-active {
      border-color: #1890ff !important;
      background: transparent !important;
    }
    .ant-pagination-item-active a {
      color: #1890ff !important;
    }
    .ant-pagination-disabled .ant-pagination-item-link {
      color: #555 !important;
      border-color: #333 !important;
    }
    .ant-checkbox-inner {
      background: transparent !important;
      border-color: #555 !important;
    }
    .ant-checkbox-checked .ant-checkbox-inner {
      background-color: #1890ff !important;
      border-color: #1890ff !important;
    }
  }
`;

export const AIResume = ({ onOpenSettings }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isPrefer, setIsPrefer] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingJob, setEditingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendDown, setBackendDown] = useState(false);
  const [healthChecking, setHealthChecking] = useState(false);

  const runHealthCheck = useCallback(async () => {
    setHealthChecking(true);
    try {
      await checkHealth();
      setBackendDown(false);
    } catch {
      setBackendDown(true);
    } finally {
      setHealthChecking(false);
    }
  }, []);

  const apiKey = useAIStore((state) => state.apiKey);
  const aiStoreHydrated = useAIStore((state) => state._hydrated);
  const getAIConfig = useAIStore((state) => state.getConfig);

  const [tasks, tasksLoading] = useTasks((state) => [state.tasks, state.loading]);
  const fetchTasks = useTasks((state) => state.fetch);
  const createTask = useTasks((state) => state.create, shallow);
  const cancelTask = useTasks((state) => state.cancel, shallow);

  const jobs = useJobs((state) => state.jobs);
  const [addJob, updateJob, purgeJobById] = useJobs(
    (state) => [state.add, state.update, state.purgeById],
    shallow
  );

  const preferResume = usePreferData((state) => state.getResume(), shallow);
  const setBaseResume = usePreferData((state) => state.set);

  const resetBasics = useIntro((state) => state.reset);
  const resetSkills = useSkills((state) => state.reset);
  const resetWork = useWork((state) => state.reset);
  const resetEducation = useEducation((state) => state.reset);
  const resetActivities = useActivities((state) => state.reset);
  const resetProjects = useProjects((state) => state.reset);
  const resetVolunteer = useVolunteer((state) => state.reset);
  const resetAwards = useAwards((state) => state.reset);

  const basics = useIntro((state) => state.intro);
  const skills = useSkills((state) => state);
  const work = useWork((state) => state.companies);
  const education = useEducation((state) => state.education);
  const activities = useActivities((state) => state);
  const projects = useProjects((state) => state.projects);
  const volunteer = useVolunteer((state) => state.volunteer);
  const awards = useAwards((state) => state.awards);

  const resume = { basics, skills, work, education, projects, activities, volunteer, awards };

  useEffect(() => {
    runHealthCheck();
    fetchTasks();
    let isPolling = false;
    const intervalId = setInterval(async () => {
      if (isPolling) return; // Prevent overlapping polls if a request is slow/pending
      const { tasks } = useTasks.getState();
      const hasPending = tasks.some((t) => t.status === 0 || t.status === 1);
      if (hasPending) {
        isPolling = true;
        try {
          await fetchTasks();
        } finally {
          isPolling = false;
        }
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [runHealthCheck]);

  const displayResume = (record) => {
    if (!record.resume?.basics) {
      messageApi.open({ type: 'warning', content: 'Resume data not found locally. Trying to reload…' });
      fetchTasks();
      return;
    }
    const r = { ...record.resume };
    resetBasics(r.basics);
    resetSkills(r.skills);
    resetWork(r.work);
    resetEducation(r.education);
    resetActivities(r.activities);
    resetProjects(r.projects);
    resetVolunteer(r.volunteer);
    resetAwards(r.awards);
    messageApi.open({ type: 'success', content: 'Resume loaded successfully!' });
  };

  const handleApplyToggle = (record) => {
    updateTask(record.id, {
      is_apply: !record.isApply,
      apply_time: new Date().toISOString(),
    })
      .then((res) => {
        if (res.status === 201) {
          messageApi.open({
            type: 'success',
            content: !record.isApply ? 'Marked as applied!' : 'Marked as not applied.',
          });
          fetchTasks();
        }
      })
      .catch((err) => console.log(err));
  };

  const handleCancel = (record) => {
    cancelTask(record.id);
    messageApi.open({ type: 'info', content: 'Cancellation requested.' });
  };

  const handleDelete = (record) => {
    purgeJobById(record.jobId);
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingJob(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setModalMode('edit');
    setEditingJob({
      jobId: record.jobId,
      title: record.title,
      company: record.company,
      link: record.link,
      description: record.description,
    });
    setModalOpen(true);
  };

  const handleModalSave = async (values) => {
    if (modalMode === 'add') {
      await addJob(values);
      await fetchTasks();
      messageApi.open({ type: 'success', content: 'Job added.' });
    } else {
      const index = jobs.findIndex((job) => job.id === editingJob.jobId);
      if (index !== -1) {
        if (values.title !== undefined) updateJob(index, 'title', values.title);
        if (values.company !== undefined) updateJob(index, 'company', values.company);
        if (values.link !== undefined) updateJob(index, 'link', values.link);
        if (values.description !== undefined) updateJob(index, 'description', values.description);
        setTimeout(() => fetchTasks(), 3500);
        messageApi.open({ type: 'success', content: 'Job updated.' });
      } else {
        messageApi.open({ type: 'warning', content: 'Job is no longer available.' });
      }
    }
    setModalOpen(false);
  };

  const handleSetCurrentAsBase = () => {
    setBaseResume(resume);
    messageApi.open({ type: 'success', content: 'Base Resume updated.' });
  };

  const handleGenerate = async (tasksToRun = null) => {
    const targetTasks = Array.isArray(tasksToRun) ? tasksToRun : selectedTasks;
    if (!targetTasks.length) {
      messageApi.open({ type: 'error', content: 'Please select at least one job.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await createTask({
        task_list: targetTasks,
        resume: isPrefer ? preferResume : resume,
        ai_config: getAIConfig(),
      });
      messageApi.open({ type: 'success', content: 'Task submitted successfully!' });
      setSelectedRowKeys([]);
      setSelectedTasks([]);
    } catch (err) {
      console.error('Failed to submit task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newKeys, newRows) => {
      setSelectedRowKeys(newKeys);
      setSelectedTasks(newRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === 0 || record.status === 1,
    }),
  };

  const handleRetry = (record) => {
    handleGenerate([record]);
  };

  const renderStatus = (status, record) => {
    if (status === -2) {
      return (
        <Space size={8}>
          <Tooltip title={record.error ? `Failed: ${record.error}` : 'Failed'}>
            <Tag icon={getIcon('delete')} color="error" />
          </Tooltip>
          <Tooltip title="Retry task">
            <a onClick={() => handleRetry(record)} aria-label="Retry task">
              {getIcon('sync')}
            </a>
          </Tooltip>
        </Space>
      );
    }
    if (status === -1) return <Tooltip title="Not started"><Tag color="default" /></Tooltip>;
    if (status === 0) return <Tooltip title="Waiting"><Tag icon={getIcon('clock')} color="default" /></Tooltip>;
    if (status === 1) return <Tooltip title="Processing"><Tag icon={getIcon('sync')} color="processing" /></Tooltip>;
    if (status === 2) {
      return (
        <Space size={8}>
          <Tooltip title="Done">
            <Tag icon={getIcon('check')} color="success" />
          </Tooltip>
          <Tooltip title="View generated resume">
            <a onClick={() => displayResume(record)} aria-label="View generated resume">
              {getIcon('eye')}
            </a>
          </Tooltip>
        </Space>
      );
    }
  };

  const buildMenu = (record) => {
    const { status } = record;
    const items = [];

    if (status === 0 || status === 1) {
      items.push(
        <Menu.Item key="cancel" onClick={() => handleCancel(record)}>
          Cancel
        </Menu.Item>
      );
    }

    if (status === 2) {
      items.push(
        <Menu.Item key="apply" onClick={() => handleApplyToggle(record)}>
          {record.isApply ? 'Mark as not applied' : 'Mark as applied'}
        </Menu.Item>
      );
    }

    if (status !== 0 && status !== 1) {
      items.push(
        <Menu.Item key="edit" onClick={() => openEditModal(record)}>
          Edit job
        </Menu.Item>
      );
      items.push(
        <Menu.Item key="delete">
          <Popconfirm
            title="Delete this job and its task?"
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <span style={{ color: '#ff4d4f' }}>Delete</span>
          </Popconfirm>
        </Menu.Item>
      );
    }

    return <Menu>{items}</Menu>;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, record) =>
        record.link ? (
          <a href={record.link} target="_blank" rel="noreferrer">{title}</a>
        ) : (
          <span>{title}</span>
        ),
    },
    { title: 'Company', dataIndex: 'company' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: renderStatus,
      filters: [
        { text: 'Failed', value: -2 },
        { text: 'Default', value: -1 },
        { text: 'Waiting', value: 0 },
        { text: 'Processing', value: 1 },
        { text: 'Done', value: 2 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      width: 80,
      render: (_, record) => (
        <Space size={4}>
          <Dropdown overlay={buildMenu(record)} trigger={['click']} placement="bottomRight">
            <a style={{ color: '#ccc', fontSize: 18, lineHeight: 1 }}>···</a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const missingApiKey = aiStoreHydrated && !apiKey;
  const hasActiveTasks = selectedTasks.some((r) => r.status === 0 || r.status === 1);

  const getGenerateDisabledReason = () => {
    if (backendDown) return 'Backend service is unreachable.';
    if (missingApiKey) return 'Please configure your API key in Settings first.';
    if (!selectedTasks.length) return 'Select at least one job from the table.';
    if (hasActiveTasks) return 'Selected jobs include tasks currently being processed.';
    return '';
  };

  const generateDisabledReason = getGenerateDisabledReason();
  const isGenerateDisabled = Boolean(generateDisabledReason) || isSubmitting;

  return (
    <Spin spinning={tasksLoading} tip="Loading...">
      <Container>
        {contextHolder}
        <PanelHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heading>AI Resume</Heading>
            <Tooltip title="Add jobs below, select them, and click Generate to create a tailored resume for each. Use the Configure section to control which resume the AI starts from.">
              <QuestionCircleOutlined style={{ color: '#666', cursor: 'help', fontSize: 14 }} />
            </Tooltip>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Popconfirm
              title="Save the resume currently on screen as your Base Resume? This will replace the existing Base Resume."
              onConfirm={handleSetCurrentAsBase}
              okText="Confirm"
              cancelText="Cancel"
            >
              <Tooltip title="Saves the resume currently visible on screen as your Base Resume, replacing the previous one.">
                <Button size="small">Set Current as Base</Button>
              </Tooltip>
            </Popconfirm>
            <Button
              type="primary"
              size="small"
              icon={getIcon('add')}
              onClick={openAddModal}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              Add Job
            </Button>
          </div>
        </PanelHeader>
        {backendDown && (
          <Alert
            type="error"
            showIcon
            style={darkAlertStyle}
            message={<span style={{ color: '#e6a0a0' }}>Backend service is unreachable</span>}
            description={
              <span style={{ color: '#bf8080' }}>
                The AI Resume feature requires the backend to be running.{' '}
                <a onClick={runHealthCheck} style={{ fontWeight: 500, color: '#1890ff' }}>
                  {healthChecking ? 'Checking…' : 'Retry →'}
                </a>
              </span>
            }
          />
        )}
        {missingApiKey && (
          <Alert
            type="warning"
            showIcon
            style={darkAlertStyle}
            message={<span style={{ color: '#e6c87a' }}>No API key configured</span>}
            description={
              <span style={{ color: '#bba96a' }}>
                Add your key in Settings to enable resume generation.{' '}<br/>
                <a onClick={onOpenSettings} style={{ fontWeight: 500, color: '#1890ff' }}>
                  Open Settings →
                </a>
              </span>
            }
          />
        )}
        <DarkTable
          rowSelection={{ type: 'checkbox', ...rowSelection }}
          columns={columns}
          dataSource={tasks}
          size="small"
          pagination={{ pageSize: 10, size: 'small' }}
        />
        <Tooltip title={isGenerateDisabled && !isSubmitting ? generateDisabledReason : ''}>
          <span>
            <Button
              type="primary"
              size="small"
              onClick={handleGenerate}
              loading={isSubmitting}
              disabled={isGenerateDisabled}
            >
              {selectedTasks.length > 0
                ? `Generate Selected (${selectedTasks.length})`
                : 'Generate Selected'}
            </Button>
          </span>
        </Tooltip>
        <Divider />
        <ConfigSection>
          <ConfigTopic>Configure</ConfigTopic>
          <ConfigRow>
            <Tooltip title="When checked, AI generates resumes starting from your Base Resume. Uncheck to use the resume currently on screen instead.">
              <FormControlLabel
                control={<Switch checked={isPrefer} onChange={(e) => setIsPrefer(e.target.checked)} />}
                label="Use Base Resume as AI input"
                sx={{ color: '#fff', fontSize: '0.7rem', margin: 0 }}
              />
            </Tooltip>
          </ConfigRow>
        </ConfigSection>
        <JobModal
          open={modalOpen}
          mode={modalMode}
          initialValues={editingJob}
          onSave={handleModalSave}
          onCancel={() => setModalOpen(false)}
        />
      </Container>
    </Spin>
  );
};
