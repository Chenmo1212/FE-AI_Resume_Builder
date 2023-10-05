import React, {useEffect, useState} from 'react';
import {Container, Heading} from 'src/core/components/editor/Editor';
import {Table, Button, message, Tag, Space, Spin, Checkbox} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import {getIcon} from 'src/styles/icons';
import {useTasks, Task, Resume} from '../../stores/jobs.store';
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

const SubmitBtn = ({selectedRows, setSelectedRowKeys, setSelectedTasks, resume, messageApi}) => {
  const create = useTasks((state: any) => state.create, shallow);
  const [isLoading, setLoading] = useState(false);
  const [isPrefer, setIsPrefer] = useState(true);
  const preferResume = usePreferData((state: any) => state.getResume(), shallow);

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

  const onPreferChange = (e: CheckboxChangeEvent) => {
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
  const fetch = useTasks((state: any) => state.fetch, shallow);
  const resetBasics = useIntro((state: any) => state.reset);
  const resetSkills = useSkills((state: any) => state.reset);
  const resetWork = useWork((state: any) => state.reset);
  const resetEducation = useEducation((state: any) => state.reset);
  const resetActivities = useActivities((state: any) => state.reset);
  const resetProjects = useProjects((state: any) => state.reset);
  const resetVolunteer = useVolunteer((state: any) => state.reset);
  const resetAwards = useAwards((state: any) => state.reset);

  useEffect(() => {
    fetch();
  }, []);

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: Task[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      onSelectedRowsChange(selectedRows);
    },
    getCheckboxProps: (record: Task) => ({
      disabled: record.status >= 0,
    }),
  };

  const columns: ColumnsType<Task> = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title: string, record: Task) => (
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
      render: (status: number) => {
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
      onFilter: (value: any, record: Task) => record.status === value,
    },
    {
      title: 'Action',
      render: (record: Task) => (
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

  const displayResume = (record: Task) => {
    const resume: Resume = {...record['resume']};
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

  const uploadResume = (record: Task) => {
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
  const basics = useIntro((state: any) => state.intro);
  const skills = useSkills((state: any) => state);
  const work = useWork((state: any) => state.companies);
  const education = useEducation((state: any) => state.education);
  const activities = useActivities((state: any) => state);
  const projects = useProjects((state: any) => state.projects);
  const volunteer = useVolunteer((state: any) => state.volunteer);
  const awards = useAwards((state: any) => state.awards);
  const [loading] = useTasks((state: any) => [state.loading]);
  const resume: Resume = {
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
