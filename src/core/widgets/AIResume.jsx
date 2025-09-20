import React, {useEffect, useState} from 'react';
import {Table, Button, message, Tag, Space, Spin, Checkbox} from 'antd';
import {useTasks} from '../../stores/jobs.store';
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
import {updateResume, updateTask} from "../../axios/api";
import { getIcon } from '../../styles/icons';
import { Container } from '@mui/material';
import { Heading } from '../components/editor/Editor';

const SubmitBtn = ({selectedRows, setSelectedRowKeys, setSelectedTasks, resume, messageApi}) => {
  const create = useTasks((state) => state.create, shallow);
  const [isLoading, setLoading] = useState(false);
  const [isPrefer, setIsPrefer] = useState(true);
  const preferResume = usePreferData((state) => state.getResume(), shallow);

  const handleSubmit = () => {
    setLoading(true)
    if (!selectedRows.length) {
      messageApi.open({
        type: 'error',
        content: 'Please select the task!',
      });
      setLoading(false)
      return;
    }

    create({
      task_list: selectedRows,
      resume: isPrefer ? preferResume : resume,
    });
    messageApi.open({
      type: 'success',
      content: 'Submit task successfully!',
    });
    setSelectedRowKeys([]);
    setSelectedTasks([]);
    setLoading(false);
  };

  const handleStatus = () => {
    for (const row of selectedRows) {
      if (row.status >= 0) {
        return true;
      }
    }
    return false;
  };

  const onPreferChange = (e) => {
    setIsPrefer(e.target.checked)
  };

  return (
    <>
      <Checkbox onChange={onPreferChange} style={{color: "#fff"}} checked={isPrefer}>Use Prefer Resume</Checkbox>
      <Button type="primary" onClick={handleSubmit} disabled={handleStatus()} loading={isLoading}>
        Submit
      </Button>
    </>
  );
};

const TaskTable = ({selectedRowKeys, onSelectedRowsChange, setSelectedRowKeys, resume, messageApi}) => {
  const [tasks] = useTasks((state) => [state.tasks]);
  const [isLoading, setLoading] = useState(false);
  const fetch = useTasks((state) => state.fetch, shallow);
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
        if (status === -1) return <Tag icon={getIcon('cloud')} color="default"/>;
        else if (status === 0) return <Tag icon={getIcon('clock')} color="default"/>;
        else if (status === 1) return <Tag icon={getIcon('sync')} color="processing"/>;
        else if (status === 2) return <Tag icon={getIcon('check')} color="success"/>;
      },
      filters: [
        {
          text: 'Default',
          value: -1,
        },
        {
          text: 'Waiting',
          value: 0,
        },
        {
          text: 'Processing',
          value: 1,
        },
        {
          text: 'Success',
          value: 2,
        },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Action',
      render: (record) => (
        <>
          <Space>
            <a onClick={() => displayResume(record)}>{getIcon('eye')}</a>
            <a onClick={() => uploadResume(record)}>{getIcon('upload')}</a>
            <a onClick={() => applyStatusHandle(record)} style={{ color: record.isApply ? '#52c41a' : '' }}>{getIcon('apply')}</a>
          </Space>
        </>
      ),
    },
  ];

  const displayResume = (record) => {
    const resume = {...record['resume']};
    resetBasics(resume.basics);
    resetSkills(resume.skills);
    resetWork(resume.work);
    resetEducation(resume.education);
    resetActivities(resume.activities);
    resetProjects(resume.projects);
    resetVolunteer(resume.volunteer);
    resetAwards(resume.awards);
    messageApi.open({
      type: 'success',
      content: 'Resume checkout successfully!',
    });
  };

  const uploadResume = (record) => {
    setLoading(true)
    updateResume(record.newResumeId, resume).then(res => {
      if (res.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Resume update successfully!',
        });
        setLoading(false);
      }
    }).catch(err=> {
      console.log(err)
      setLoading(false);
    })
  };

  const applyStatusHandle = (record) => {
    setLoading(true);
    updateTask(record.id, {is_apply: !record.isApply, apply_time: new Date().toISOString()}).then(res => {
      if (res.status === 201) {
        messageApi.open({
          type: 'success',
          content: !record.isApply ? 'Successfully applied!' : "Waiting to apply!",
        });
        fetch();
        setLoading(false);
      }
    }).catch(err=>{
      console.log(err)
      setLoading(false);
    })
  }

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
  const [loading] = useTasks((state) => [state.loading]);
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
            resume={resume}
            messageApi={messageApi}
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
