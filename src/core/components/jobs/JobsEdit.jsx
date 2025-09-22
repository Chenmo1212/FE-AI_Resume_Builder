import React, { useEffect, useState } from 'react';
import { Container, Heading } from '../editor/Editor';
import { useJobs } from '../../../stores/jobs.store';
import shallow from 'zustand/shallow';
import { TimelineEdit } from '../editor/TimelineEdit';
import { JOBS_METADATA } from '../../meta-data/input_metadata';
import { Spin, message } from "antd";

export const JobEditor = () => {
  const [jobs, loading] = useJobs((state) => [state.jobs, state.loading]);
  const [fetch, add, update, purge] = useJobs(
    (state) => [state.fetch, state.add, state.update, state.purge],
    shallow
  );
  const [error, setError] = useState(null);

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        await fetch();
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again.');
        message.error('Failed to load jobs');
      }
    };

    fetchJobs();
  }, [fetch]);

  // Enhanced add function with error handling
  const handleAdd = async () => {
    try {
      await add();
    } catch (err) {
      console.error('Error adding job:', err);
      message.error('Failed to add job');
    }
  };

  // Enhanced update function with error handling
  const handleUpdate = async (index, key, value) => {
    try {
      await update(index, key, value);
    } catch (err) {
      console.error('Error updating job:', err);
      message.error('Failed to update job');
    }
  };

  // Enhanced purge function with error handling
  const handlePurge = async (index) => {
    try {
      await purge(index);
    } catch (err) {
      console.error('Error deleting job:', err);
      message.error('Failed to delete job');
    }
  };

  return (
    <Spin spinning={loading} tip="Loading...">
      <Container>
        <Heading>Jobs</Heading>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
            <button 
              className="ml-2 underline" 
              onClick={() => {
                setError(null);
                fetch();
              }}
            >
              Try Again
            </button>
          </div>
        )}
        
        <TimelineEdit
          METADATA={JOBS_METADATA}
          itemList={jobs}
          identifier="title"
          operations={{
            update: handleUpdate, 
            add: handleAdd, 
            purge: handlePurge
          }}
        />
      </Container>
    </Spin>
  );
};
