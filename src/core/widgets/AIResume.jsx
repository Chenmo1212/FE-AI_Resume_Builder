import React, { useEffect, useState } from 'react';
import {
  Table, Button, message, Tag, Space, Spin,
  Checkbox, Tooltip, Dropdown, Menu, Alert, Popconfirm,
} from 'antd';
import { useTasks, useJobs } from '../../stores/jobs.store';
import shallow from 'zustand/shallow';
import {
  useActivities, useAwards, useEducation, useIntro,
  usePreferData, useProjects, useSkills, useVolunteer, useWork,
} from '../../stores/data.store';
import { updateTask } from '../../axios/api';
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

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

const DarkTable = styled(Table)`
  .ant-table,
  .ant-table-container,
  .ant-table-content,
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td,
  .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    background: transparent;
    color: #e6e6e6;
    border-color: #444;
  }
  .ant-table-thead > tr > th {
    color: #aaa;
  }
  .ant-pagination-item a,
  .ant-pagination-prev button,
  .ant-pagination-next button {
    color: #aaa;
  }
  .ant-pagination-item-active {
    border-color: #1890ff;
  }
  .ant-pagination-item-active a {
    color: #1890ff;
  }
  .ant-checkbox-inner {
    background: transparent;
    border-color: #555;
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

  const apiKey = useAIStore((state) => state.apiKey);
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
    fetchTasks();
    const intervalId = setInterval(() => {
      const { tasks } = useTasks.getState();
      const hasPending = tasks.some((t) => t.status === 0 || t.status === 1);
      if (hasPending) fetchTasks();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const displayResume = (record) => {
    if (!record.resume?.basics) {
      messageApi.open({ type: 'warning', content: 'Resume not ready yet, please wait.' });
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

  const handleGenerate = () => {
    if (!selectedTasks.length) {
      messageApi.open({ type: 'error', content: 'Please select at least one job.' });
      return;
    }
    createTask({
      task_list: selectedTasks,
      resume: isPrefer ? preferResume : resume,
      ai_config: getAIConfig(),
    });
    messageApi.open({ type: 'success', content: 'Task submitted successfully!' });
    setSelectedRowKeys([]);
    setSelectedTasks([]);
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

  const renderStatus = (status, record) => {
    if (status === -2) return <Tooltip title="Failed"><Tag icon={getIcon('delete')} color="error" /></Tooltip>;
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

  const missingApiKey = !apiKey;
  const hasActiveTasks = selectedTasks.some((r) => r.status === 0 || r.status === 1);

  return (
    <Spin spinning={tasksLoading} tip="Loading...">
      <Container>
        {contextHolder}
        <PanelHeader>
          <Heading>AI Resume</Heading>
          <Button
            type="primary"
            size="small"
            icon={getIcon('add')}
            onClick={openAddModal}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            Add Job
          </Button>
        </PanelHeader>
        {missingApiKey && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="No API key configured"
            description={
              <span>
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
        <Footer>
          <Checkbox onChange={(e) => setIsPrefer(e.target.checked)} checked={isPrefer} style={{ color: '#ccc' }}>
            Use Preferred Resume
          </Checkbox>
          <Button type="primary" onClick={handleGenerate} disabled={missingApiKey || hasActiveTasks}>
            Generate Selected
          </Button>
        </Footer>
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
