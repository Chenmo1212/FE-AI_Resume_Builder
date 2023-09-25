import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { SideDrawer } from 'src/core/widgets/SideDrawer';
import { Templates } from 'src/core/components/templates/Templates';
import { Themes } from 'src/core/components/themes/Themes';
import { SideMenu } from 'src/core/widgets/SideMenu';
import { PrintSettings } from 'src/core/widgets/PrintSettings';
import { AIResume } from 'src/core/widgets/AIResume';
import { useRightDrawer, useZoom } from 'src/stores/settings.store';
import { getIcon } from 'src/styles/icons';
import { SaveSettings } from '../widgets/SaveSettings';
import { UploadSettings } from '../widgets/UploadSettings';
import { useActivities, useEducation, useIntro, useSkills, useWork } from 'src/stores/data.store';
import { Tooltip } from 'antd';
import { SideBackground } from '../widgets/SideBackground';

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1;

  @media print {
    display: none;
  }
`;

const sideBarList = [
  {
    key: 0,
    title: 'Template',
    icon: 'template',
    component: <Templates />,
  },
  {
    key: 1,
    title: 'Theme',
    icon: 'color',
    component: <Themes />,
  },
  {
    key: 2,
    title: 'Robot',
    icon: 'robot',
    component: <AIResume />,
  },
];

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

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useRightDrawer((state: any) => [state.activeTab, state.update]);
  const zoom = useZoom((state: any) => state.zoom);
  const updateZoom = useZoom((state: any) => state.update);

  const resetBasics = useIntro((state: any) => state.reset);
  const resetSkills = useSkills((state: any) => state.reset);
  const resetWork = useWork((state: any) => state.reset);
  const resetEducation = useEducation((state: any) => state.reset);
  const resetActivities = useActivities((state: any) => state.reset);

  const clickHandler = useCallback(
    (event: any) => {
      const currId = Number(event.currentTarget.dataset.id);
      if (activeTab === currId) setActiveTab(-1);
      else setActiveTab(currId);
    },
    [activeTab, setActiveTab]
  );

  const zoomout = useCallback(() => {
    updateZoom(zoom - 0.1);
  }, [zoom, updateZoom]);

  const zoomin = useCallback(() => {
    updateZoom(zoom + 0.1);
  }, [zoom, updateZoom]);

  const reset = () => {
    resetBasics();
    resetSkills();
    resetWork();
    resetEducation();
    resetActivities();
  };

  return (
    <Wrapper>
      <SideDrawer isShown={activeTab !== -1} width={activeTab === 2 ? '600px' : ''}>
        {sideBarList[activeTab]?.component}
      </SideDrawer>
      <SideMenu menuList={sideBarList} onClick={clickHandler}>
        <IconWrapper onClick={zoomout}>
          <Tooltip placement="left" title={'Zoom Out'}>
            <IconButton>{getIcon('zoomout')}</IconButton>
          </Tooltip>
        </IconWrapper>

        <IconWrapper onClick={zoomin}>
          <Tooltip placement="left" title={'Zoom In'}>
            <IconButton>{getIcon('zoomin')}</IconButton>
          </Tooltip>
        </IconWrapper>

        <IconWrapper onClick={reset}>
          <Tooltip placement="left" title={'Reset'}>
            <IconButton>{getIcon('reset')}</IconButton>
          </Tooltip>
        </IconWrapper>

        <UploadSettings />
        <SaveSettings />
        <PrintSettings />
      </SideMenu>
      <SideBackground isShown={activeTab !== -1} update={setActiveTab} />
    </Wrapper>
  );
};
