import React, { useEffect, useState } from 'react';
import { Container, Heading } from 'src/core/components/editor/Editor';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getIcon } from 'src/styles/icons';
import { useJobs } from '../../stores/jobs.store';
import shallow from 'zustand/shallow';

interface Job {
  id?: number;
  company: string;
  title: string;
  link: string;
}

const columns: ColumnsType<Job> = [
  {
    title: 'Title',
    dataIndex: 'title',
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

const SubmitBtn = ({ selectedRows }) => {
  const handleSubmit = () => {
    console.log('Selected Rows in SubmitBtn:', selectedRows);
  };

  return (
    <>
      <Button type="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </>
  );
};

const JobTable = ({ onSelectedRowsChange }) => {
  let [jobs, loading] = useJobs((state) => [state.jobs, state.loading]);
  const fetch = useJobs((state: any) => state.fetch, shallow);

  useEffect(() => {
    fetch();
  }, []);

  const jobWithKeys: any[] = jobs.map((item, index) => ({
    ...item,
    key: index.toString(),
  }));

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: Job[]) => {
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
        dataSource={loading ? [] : jobWithKeys}
      />
    </div>
  );
};

export const UpdateResume = () => {
  const [selectedJobs, setSelectedJobs] = useState([]);
  return (
    <>
      <Container>
        <Heading>AI Resume</Heading>
        <JobTable onSelectedRowsChange={(selectedJobs) => setSelectedJobs(selectedJobs)} />
        <SubmitBtn selectedRows={selectedJobs} />
      </Container>
    </>
  );
};
