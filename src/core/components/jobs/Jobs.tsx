import React from 'react';
import { Container, Heading } from '../editor/Editor';
import { Table, Divider, Input as AntInput, Radio } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getIcon } from 'src/styles/icons';

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

const data: Job[] = [
  {
    key: '0',
    id: 0,
    company: 'company 1',
    job: 'Front-end',
    link: 'https://www.chenmo1212.cn',
  },
  {
    key: '1',
    id: 1,
    company: 'company 2',
    job: 'Back-end',
    link: 'https://www.chenmo1212.cn',
  },
  {
    key: '2',
    id: 2,
    company: 'Company 3',
    job: 'Full-stack engineer',
    link: 'https://www.chenmo1212.cn',
  },
];

// rowSelection object indicates the need for row selection
const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: Job[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
};

const JobTable = () => {
  return (
    <div>
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
      />
    </div>
  );
};

export const JobEditor = () => (
  <>
    <Container>
      <Heading>Job Editor</Heading>
      <JobTable />
    </Container>
  </>
);
