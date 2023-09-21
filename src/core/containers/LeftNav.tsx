import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { SideDrawer } from 'src/core/widgets/SideDrawer';
import {
  SocialEditor,
  EduEditor,
  ExperienceEditor,
  SkillsEditor,
  IntroEditor,
  ForteEditor,
  LabelsEditor,
  ActivitiesEditor,
} from 'src/core/components/editor/Editor';
import { SideMenu } from 'src/core/widgets/SideMenu';
import { SideBackground } from 'src/core/widgets/SideBackground';
import { useLeftDrawer } from 'src/stores/settings.store';

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
    title: 'Skills',
    icon: 'tool',
    component: <SkillsEditor />,
  },
  {
    key: 3,
    title: 'Experience',
    icon: 'work',
    component: <ExperienceEditor />,
  },
  {
    key: 4,
    title: 'Education',
    icon: 'education',
    component: <EduEditor />,
  },
  {
    key: 5,
    title: 'Awards',
    icon: 'awards',
    component: <ForteEditor />,
  },
  {
    key: 6,
    title: 'Activities',
    icon: 'certificate',
    component: <ActivitiesEditor />,
  },
  {
    key: 7,
    title: 'Label',
    icon: 'label',
    component: <LabelsEditor />,
  },
];

export const LeftNav = () => {
  const [activeTab, setActiveTab] = useLeftDrawer((state: any) => [state.activeTab, state.update]);

  const clickHandler = useCallback(
    (event: any) => {
      if (activeTab === event.currentTarget.dataset.id) setActiveTab(-1);
      else setActiveTab(event.currentTarget.dataset.id);
    },
    [activeTab, setActiveTab]
  );

  return (
    <Wrapper>
      <SideMenu menuList={leftNavList} onClick={clickHandler} />
      <SideDrawer isShown={activeTab !== -1}>{leftNavList[activeTab]?.component}</SideDrawer>
      <SideBackground isShown={activeTab !== -1} />
    </Wrapper>
  );
};
