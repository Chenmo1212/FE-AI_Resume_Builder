import React, { useCallback } from 'react';
import styled from 'styled-components';
import { JobEditor } from '../components/jobs/JobsEdit';
import {
  SocialEditor,
  EduEditor,
  ExperienceEditor,
  SkillsEditor,
  IntroEditor,
  ForteEditor,
  LabelsEditor,
  ActivitiesEditor
} from '../components/editor/Editor';
import { SideMenu } from '../widgets/SideMenu';
import { SideDrawer } from '../widgets/SideDrawer';
import { SideBackground } from '../widgets/SideBackground';
import { useLeftDrawer } from '../../stores/settings.store';

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;

  @media print {
    display: none;
  }
`;

export const leftNavList = [
  {
    key: 0,
    title: 'Intro',
    icon: 'identity',
    component: <IntroEditor />,
  },
  {
    key: 1,
    title: 'Social',
    icon: 'social',
    component: <SocialEditor />,
  },
  {
    key: 2,
    title: 'Education',
    icon: 'education',
    component: <EduEditor />,
  },
  {
    key: 3,
    title: 'Experience',
    icon: 'work',
    component: <ExperienceEditor />,
  },
  {
    key: 4,
    title: 'Awards',
    icon: 'awards',
    component: <ForteEditor />,
  },
  {
    key: 5,
    title: 'Activities',
    icon: 'certificate',
    component: <ActivitiesEditor />,
  },
  {
    key: 6,
    title: 'Label',
    icon: 'label',
    component: <LabelsEditor />,
  },
  {
    key: 7,
    title: 'Skills',
    icon: 'tool',
    component: <SkillsEditor />,
  },
  {
    key: 8,
    title: 'Job',
    icon: 'job',
    disabled: true,
    component: <JobEditor />,
  },
];

export const LeftNav = () => {
  const [activeTab, setActiveTab] = useLeftDrawer((state) => [state.activeTab, state.update]);

  const clickHandler = useCallback(
    (event) => {
      if (activeTab === event.currentTarget.dataset.id) setActiveTab(-1);
      else setActiveTab(event.currentTarget.dataset.id);
    },
    [activeTab, setActiveTab]
  );

  return (
    <Wrapper>
      <SideMenu menuList={leftNavList} onClick={clickHandler} />
      <SideDrawer isShown={activeTab !== -1}>{leftNavList[activeTab]?.component}</SideDrawer>
      <SideBackground isShown={activeTab !== -1} update={setActiveTab} />
    </Wrapper>
  );
};
