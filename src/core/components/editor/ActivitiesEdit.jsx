import React, { Fragment } from 'react';
import styled from 'styled-components';
// import { Input as AntInput } from 'antd';
// import { ACHIEVEMNT_METADATA } from 'core/meta-data/input_metadata';
import { useActivities, useProjects } from '../../../stores/data.store';
import { MarkDownField } from '../../widgets/MarkdownField';
import { ProjectEditor } from './Editor';

const Wrapper = styled.div`
  margin: 8px 0;
`;

const Topic = styled.p`
  font-size: 0.875rem;../../../
  font-weight: 600;
  color: #fff;
  margin-bottom: 7px;
`;

export function ActivitiesEdit() {
  const { involvements, achievements } = useActivities((state) => state);
  const update = useActivities((state) => state.update);

  return (
    <>
      <Wrapper>
        <Topic>Involvements</Topic>
        <MarkDownField value={involvements} setValue={(text) => update('involvements', text)} />
      </Wrapper>

      <ProjectEditor />

      <Wrapper>
        <Topic>Achievements</Topic>
        <MarkDownField value={achievements} setValue={(text) => update('achievements', text)} />
      </Wrapper>
    </>
  );
}
