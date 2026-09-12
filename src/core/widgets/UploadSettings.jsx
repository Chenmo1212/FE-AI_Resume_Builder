import React, { useState } from 'react';
import styled from 'styled-components';
import { Upload, Tooltip, Modal, Typography } from 'antd';
import {
  useActivities,
  useAwards,
  useEducation,
  useIntro,
  usePreferData,
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
  const setBaseResume = usePreferData((state) => state.set);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingResume, setPendingResume] = useState(null);

  function beforeUpload(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const parsed = JSON.parse(e.target.result);
      resetBasics(parsed.basics);
      resetSkills(parsed.skills);
      resetWork(parsed.work);
      resetEducation(parsed.education);
      resetActivities(parsed.activities);
      resetProjects(parsed.projects);
      resetVolunteer(parsed.volunteer);
      resetAwards(parsed.awards);
      setPendingResume(parsed);
      setModalOpen(true);
    };
    reader.readAsText(file);
    return false; // prevent antd from attempting an HTTP upload
  }

  const handleSetAsBase = () => {
    if (pendingResume) {
      setBaseResume(pendingResume);
    }
    setModalOpen(false);
    setPendingResume(null);
  };

  const handleSkipBase = () => {
    setModalOpen(false);
    setPendingResume(null);
  };

  const props = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    accept: '.json',
    beforeUpload,
  };

  return (
    <>
      <IconWrapper>
        <Upload {...props}>
          <Tooltip placement="left" title={'Upload'}>
            <IconButton>{getIcon('upload')}</IconButton>
          </Tooltip>
        </Upload>
      </IconWrapper>
      <Modal
        open={modalOpen}
        title="Set as Base Resume?"
        okText="Yes, set as Base Resume"
        cancelText="No, just load it"
        onOk={handleSetAsBase}
        onCancel={handleSkipBase}
      >
        <Typography.Paragraph>
          Your <strong>Base Resume</strong> is your personal starting point. The AI uses it when generating tailored resumes, and you can reset any section back to it at any time.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Would you like to also save this uploaded resume as your Base Resume?
        </Typography.Paragraph>
      </Modal>
    </>
  );
}
