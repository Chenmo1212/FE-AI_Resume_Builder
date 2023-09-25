import React, { useEffect, useState } from 'react';
import { Container, Heading } from 'src/core/components/editor/Editor';
import { Table, Button, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getIcon } from 'src/styles/icons';
import { useTasks } from '../../stores/jobs.store';
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

interface Task {
  id?: string;
  company?: string;
  title?: string;
  link?: string;
  status?: number;
}

const columns: ColumnsType<Task> = [
  {
    title: 'Title',
    dataIndex: 'title',
  },
  {
    title: 'Company',
    dataIndex: 'company',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status: number) => {
      if (status === -1) return <Tag icon={getIcon('cloud')} color="default" />;
      else if (status === 0) return <Tag icon={getIcon('clock')} color="default" />;
      else if (status === 1) return <Tag icon={getIcon('sync')} color="processing" />;
      else if (status === 2) return <Tag icon={getIcon('check')} color="success" />;
    },
  },
  {
    title: 'Link',
    dataIndex: 'link',
    render: (url: string) => (
      <a href={url} target="_blank" rel="noreferrer">
        {getIcon('globe')}
      </a>
    ),
  },
];

interface Resume {
  basics: object;
  skills: object;
  work: object;
  education: object;
  projects: object;
  activities: object;
  volunteer: object;
  awards: object;
}

const SubmitBtn = ({ selectedRows }) => {
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
  const create = useTasks((state: any) => state.create, shallow);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async () => {
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
  };

  return (
    <>
      {contextHolder}
      <Button type="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </>
  );
};

const TaskTable = ({ onSelectedRowsChange }) => {
  const [tasks] = useTasks((state) => [state.tasks]);
  const fetch = useTasks((state: any) => state.fetch, shallow);

  useEffect(() => {
    fetch();
  }, []);

  console.log('tasks', tasks);

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: Task[]) => {
      onSelectedRowsChange(selectedRows);
    },
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
      />
    </div>
  );
};

export const AIResume = () => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  return (
    <>
      <Container>
        <Heading>AI Resume</Heading>
        <TaskTable onSelectedRowsChange={(selectedTasks) => setSelectedTasks(selectedTasks)} />
        <SubmitBtn selectedRows={selectedTasks} />
      </Container>
    </>
  );
};
