import React from 'react';
import { Container, Heading } from 'src/core/components/editor/Editor';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getIcon } from 'src/styles/icons';
import { useJobs } from '../../stores/jobs.store';

interface Job {
  key: React.Key;
  id?: number;
  company: string;
  job: string;
  link: string;
}

const columns: ColumnsType<Job> = [
  {
    title: 'Job',
    dataIndex: 'job',
  },
  {
    title: 'Company',
    dataIndex: 'company',
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

// rowSelection object indicates the need for row selection
const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: Job[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
};

const JobTable = () => {
  let jobs = useJobs((state) => state.jobs);
  const jobWithKeys: Job[] = jobs.map((item, index) => ({
    ...item,
    key: index.toString(),
  }));
  return (
    <div>
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        columns={columns}
        dataSource={jobWithKeys}
      />
    </div>
  );
};

export const UpdateResume = () => (
  <>
    <Container>
      <Heading>Job Editor</Heading>
      <JobTable />
    </Container>
  </>
);
