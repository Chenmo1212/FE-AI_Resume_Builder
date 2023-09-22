import React from 'react';
import { Container, Heading } from '../editor/Editor';
import { useJobs } from 'src/stores/jobs.store';
import shallow from 'zustand/shallow';
import { TimelineEdit } from '../editor/TimelineEdit';
import { JOBS_METADATA } from '../../meta-data/input_metadata';

export const JobEditor = () => {
  const jobs = useJobs((state: any) => state.jobs);
  console.log({ jobs });
  const [add, update, purge] = useJobs(
    (state: any) => [state.add, state.update, state.purge],
    shallow
  );

  return (
    <Container>
      <Heading>Jobs</Heading>
      <TimelineEdit
        METADATA={JOBS_METADATA}
        itemList={jobs}
        identifier="job"
        operations={{ update, add, purge }}
      />
    </Container>
  );
};
