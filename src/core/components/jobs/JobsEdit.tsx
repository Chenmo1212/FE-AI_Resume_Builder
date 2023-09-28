import React, { useEffect } from 'react';
import { Container, Heading } from '../editor/Editor';
import { useJobs } from 'src/stores/jobs.store';
import shallow from 'zustand/shallow';
import { TimelineEdit } from '../editor/TimelineEdit';
import { JOBS_METADATA } from '../../meta-data/input_metadata';

export const JobEditor = () => {
  const [jobs, loading] = useJobs((state) => [state.jobs, state.loading]);
  const [fetch, add, update, purge] = useJobs(
    (state: any) => [state.fetch, state.add, state.update, state.purge],
    shallow
  );

  useEffect(() => {
    fetch();
  }, []);

  return (
    <Container>
      <Heading>Jobs</Heading>
      <TimelineEdit
        METADATA={JOBS_METADATA}
        itemList={loading ? [] : jobs}
        identifier="title"
        operations={{ update, add, purge }}
      />
    </Container>
  );
};
