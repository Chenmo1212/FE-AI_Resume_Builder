import React from 'react';
import styled from 'styled-components';
import { Upload, Tooltip } from 'antd';
import {
  useActivities,
  useAwards,
  useEducation,
  useIntro,
  useSkills,
  useVolunteer,
  useWork,
  useProjects,
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
  font-size: 1.4rem;
`;

export function UploadSettings() {
  const resetBasics = useIntro((state) => state.reset);
  const resetSkills = useSkills((state) => state.reset);
  const resetWork = useWork((state) => state.reset);
  const resetEducation = useEducation((state) => state.reset);
  const resetActivities = useActivities((state) => state.reset);
  const resetProjects = useProjects((state) => state.reset);
  const resetVolunteer = useVolunteer((state) => state.reset);
  const resetAwards = useAwards((state) => state.reset);

  function beforeUpload(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      const userJSoN = JSON.parse(e.target.result);
      resetBasics(userJSoN.basics);
      resetSkills(userJSoN.skills);
      resetWork(userJSoN.work);
      resetEducation(userJSoN.education);
      resetActivities(userJSoN.activities);
      resetProjects(userJSoN.projects);
      resetVolunteer(userJSoN.volunteer);
      resetAwards(userJSoN.awards);
    };
    reader.readAsText(file);
  }

  const props = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    accept: '.json',
    beforeUpload,
  };

  return (
    <IconWrapper>
      <Upload {...props}>
        <Tooltip placement="left" title={'Upload'}>
          <IconButton>{getIcon('upload')}</IconButton>
        </Tooltip>
      </Upload>
    </IconWrapper>
  );
}
