import React, { useEffect, useState } from 'react';
import { Container, Heading } from 'src/core/components/editor/Editor';
import { Table, Button, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getIcon } from 'src/styles/icons';
import { useTasks, Task, Resume } from '../../stores/jobs.store';
import shallow from 'zustand/shallow';
import {
  useActivities,
  useAwards,
  useEducation,
  useIntro,
  useProjects,
  useSkills,
  useVolunteer,
  useWork,
} from '../../stores/data.store';
import { useRightDrawer } from '../../stores/settings.store';
import {updateResume} from "../../axios/api";

const SubmitBtn = ({selectedRows, setSelectedRowKeys, setSelectedTasks, resume}) => {
  const create = useTasks((state: any) => state.create, shallow);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = () => {
    if (!selectedRows.length) {
      messageApi.open({
        type: 'error',
        content: 'Please select the task!',
      });
      return;
    }

    const jobList = selectedRows.map((task) => ({
      id: task.jobId,
      description: task.description,
      link: task.link,
      title: task.title,
    }));
    create({
      job_list: jobList,
      resume: resume,
    });
    messageApi.open({
      type: 'success',
      content: 'Submit task successfully!',
    });
    setSelectedRowKeys([]);
    setSelectedTasks([]);
  };

  const handleStatus = () => {
    for (const row of selectedRows) {
      if (row.status >= 0) {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      { contextHolder }
      <Button type="primary" onClick={ handleSubmit } disabled={ handleStatus() }>
        Submit
      </Button>
    </>
  );
};

const TaskTable = ({selectedRowKeys, onSelectedRowsChange, setSelectedRowKeys, resume}) => {
  const [setActiveTab] = useRightDrawer((state) => [state.update]);
  const [tasks] = useTasks((state) => [state.tasks]);
  const fetch = useTasks((state: any) => state.fetch, shallow);
  const resetBasics = useIntro((state: any) => state.reset);
  const resetSkills = useSkills((state: any) => state.reset);
  const resetWork = useWork((state: any) => state.reset);
  const resetEducation = useEducation((state: any) => state.reset);
  const resetActivities = useActivities((state: any) => state.reset);
  const resetProjects = useProjects((state: any) => state.reset);
  const resetVolunteer = useVolunteer((state: any) => state.reset);
  const resetAwards = useAwards((state: any) => state.reset);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetch();
  }, []);

  console.log('tasks', tasks);

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
          <a href={ record.link } target="_blank" rel="noreferrer">
            { title }
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
        if (status === -1) return <Tag icon={ getIcon('cloud') } color="default"/>;
        else if (status === 0) return <Tag icon={ getIcon('clock') } color="default"/>;
        else if (status === 1) return <Tag icon={ getIcon('sync') } color="processing"/>;
        else if (status === 2) return <Tag icon={ getIcon('check') } color="success"/>;
      },
    },
    {
      title: 'Action',
      render: (record: Task) => (
        <>
          <a onClick={ () => displayResume(record) }>{ getIcon('eye') }</a>
          <a onClick={ () => uploadResume(record) }>{ getIcon('eye') }</a>
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
    setActiveTab(-1);
  };

  const uploadResume = (record: Task) => {
    updateResume(record.newResumeId, resume).then(res => {
      if (res.status === 200) {
        messageApi.open({
          type: 'success',
          content: 'Resume update successfully!',
        });
      }
    })
  };

  return (
    <div>
      { contextHolder }
      <Table
        rowSelection={ {
          type: 'checkbox',
          ...rowSelection,
        } }
        columns={ columns }
        dataSource={ tasks }
      />
    </div>
  );
};

export const AIResume = () => {
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
      <Container>
        <Heading>AI Resume</Heading>
        <TaskTable
          selectedRowKeys={ selectedRowKeys }
          onSelectedRowsChange={ (selectedTasks) => setSelectedTasks(selectedTasks) }
          setSelectedRowKeys={ setSelectedRowKeys }
          resume={resume}
        />
        <SubmitBtn
          selectedRows={ selectedTasks }
          setSelectedRowKeys={ setSelectedRowKeys }
          setSelectedTasks={ setSelectedTasks }
          resume={resume}
        />
      </Container>
    </>
  );
};
