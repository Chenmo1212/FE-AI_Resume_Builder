import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import exportFromJSON from 'export-from-json';
import {
  useActivities,
  useAwards,
  useEducation,
  useIntro,
  useProjects,
  useSkills,
  useVolunteer,
  useWork
} from '../../stores/data.store';
import { getIcon } from '../../styles/icons';

const IconWrapper = styled.div`
  outline-color: transparent;
  margin-bottom: 1rem;
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  height: 36px;
  width: 40px;
  background: transparent;
  border: 0;
  border-radius: 2px;
  padding: 0;
  color: rgb(230, 230, 230);
`;

export function SaveSettings() {
  const basics = useIntro((state) => state.intro);
  const skills = useSkills((state) => state);
  const work = useWork((state) => state.companies);
  const education = useEducation((state) => state.education);
  const activities = useActivities((state) => state);
  const projects = useProjects((state) => state.projects);
  const volunteer = useVolunteer((state) => state.volunteer);
  const awards = useAwards((state) => state.awards);

  function save() {
    const fileName = basics.name + '_' + new Date().toLocaleString();
    const exportType = exportFromJSON.types.json;

    exportFromJSON({
      data: { basics, skills, work, education, projects, activities, volunteer, awards },
      fileName,
      exportType,
    });
  }

  return (
    <IconWrapper>
      <Tooltip placement="left" title={'Save'}>
        <IconButton onClick={save}>{getIcon('save')}</IconButton>
      </Tooltip>
    </IconWrapper>
  );
}
