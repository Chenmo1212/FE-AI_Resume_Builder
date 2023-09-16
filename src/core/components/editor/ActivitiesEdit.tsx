import React, { Fragment } from 'react';
import styled from 'styled-components';
// import { Input as AntInput } from 'antd';
// import { ACHIEVEMNT_METADATA } from 'core/meta-data/input_metadata';
import { useActivities } from 'src/stores/data.store';
import { MarkDownField } from 'src/core/widgets/MarkdownField';
import { Container, Heading } from './Editor';
import { TimelineEdit } from './TimelineEdit';
import { PROJECT_METADATA } from 'src/core/meta-data/input_metadata';

const Wrapper = styled.div`
  margin: 8px 0;
`;

const Topic = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 7px;
`;

export function ActivitiesEdit() {
  const { involvements, projects, achievements } = useActivities((state: any) => state);

  const [add, update, purge, changeOrder] = useActivities((state: any) => [
    state.add,
    state.update,
    state.purge,
    state.changeOrder,
  ]);

  console.log({ projects });

  return (
    <>
      <Wrapper>
        <Topic>Involvements</Topic>
        <MarkDownField value={involvements} setValue={(text) => update('involvements', text)} />
      </Wrapper>

      <Container>
        <Heading>Projects</Heading>
        <TimelineEdit
          METADATA={PROJECT_METADATA}
          itemList={projects}
          identifier="title"
          operations={{ update, add, purge, changeOrder }}
        />
      </Container>

      <Wrapper>
        <Topic>Achievements</Topic>
        <MarkDownField value={achievements} setValue={(text) => update('achievements', text)} />
      </Wrapper>
    </>
  );
}
