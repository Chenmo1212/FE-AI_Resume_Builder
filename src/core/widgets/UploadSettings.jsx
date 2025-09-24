import React from 'react';
import styled from 'styled-components';
import { Upload, Tooltip, Modal } from 'antd';
import {
  useActivities,
  useAwards,
  useEducation,
  useIntro,
  useSkills,
  useVolunteer,
  useWork,
  useProjects,
  usePreferData,
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
  const preferData = usePreferData();

  function applyResumeData(userJSoN) {
    resetBasics(userJSoN.basics);
    resetSkills(userJSoN.skills);
    resetWork(userJSoN.work.map((company) => ({
      ...company,
      // Add * before highlights if they don't start with it
      summary: company.highlights.map(h => h.startsWith('*') ? h : `* ${h}`).join('\n'),
    })));
    resetEducation(userJSoN.education);
    resetActivities(userJSoN.activities);
    resetProjects(userJSoN.projects);
    resetVolunteer(userJSoN.volunteer);
    resetAwards(userJSoN.awards);
  }

  function setAsDefaultResume(userJSoN) {
    // Update the default resume data
    preferData.basics = userJSoN.basics;
    preferData.education = userJSoN.education;
    preferData.awards = userJSoN.awards;
    preferData.volunteer = userJSoN.volunteer;
    preferData.skills = userJSoN.skills;
    preferData.activities = userJSoN.activities;
    preferData.projects = userJSoN.projects;
    preferData.work = userJSoN.work;
    
    console.log('Resume set as default successfully');
  }

  function beforeUpload(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      const userJSoN = JSON.parse(e.target.result);
      // Apply the resume data immediately
      applyResumeData(userJSoN);
      
      // Show the confirmation dialog using Modal.confirm
      Modal.confirm({
        title: 'Set as Default Resume',
        content: (
          <div>
            <p>Do you want to set this resume as the default resume?</p>
            <p>This will be used when resetting your resume data.</p>
          </div>
        ),
        okText: 'Yes',
        cancelText: 'No',
        onOk() {
          setAsDefaultResume(userJSoN);
        },
        zIndex: 1500,
      });
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
