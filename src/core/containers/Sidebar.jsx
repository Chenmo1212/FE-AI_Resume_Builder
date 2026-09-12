import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { SaveSettings } from '../widgets/SaveSettings';
import { UploadSettings } from '../widgets/UploadSettings';
import { Tooltip } from 'antd';
import { SideBackground } from '../widgets/SideBackground';
import { Templates } from '../components/templates/Templates';
import { Themes } from '../components/themes/Themes';
import { AIResume } from '../widgets/AIResume';
import { useRightDrawer, useZoom } from '../../stores/settings.store';
import { useActivities, useEducation, useIntro, useProjects, useSkills, useWork } from '../../stores/data.store';
import { SideDrawer } from '../widgets/SideDrawer';
import { SideMenu } from '../widgets/SideMenu';
import { PrintSettings } from '../widgets/PrintSettings';
import { SettingsModal } from '../widgets/SettingsModal';
import { getIcon } from '../../styles/icons';

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  position: fixed;
  right: 0;
  top: 0;

  @media print {
    display: none;
  }
`;

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('ai');
  const [activeTab, setActiveTab] = useRightDrawer((state) => [state.activeTab, state.update]);
  const [aiOpen, setAiOpen] = useState(false);
  const zoom = useZoom((state) => state.zoom);
  const updateZoom = useZoom((state) => state.update);

  const openSettingsOnAITab = () => {
    setSettingsTab('ai');
    setSettingsOpen(true);
  };

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
  ];

  const resetBasics = useIntro((state) => state.reset);
  const resetSkills = useSkills((state) => state.reset);
  const resetWork = useWork((state) => state.reset);
  const resetEducation = useEducation((state) => state.reset);
  const resetActivities = useActivities((state) => state.reset);
  const resetProjects = useProjects((state) => state.reset);

  const clickHandler = useCallback(
    (event) => {
      const currId = Number(event.currentTarget.dataset.id);
      if (activeTab === currId) setActiveTab(-1);
      else { setActiveTab(currId); setAiOpen(false); }
    },
    [activeTab, setActiveTab, setAiOpen]
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
    resetProjects();
  };

  const bottomSlot = (
    <>
      <IconWrapper onClick={() => { setAiOpen((v) => !v); setActiveTab(-1); }}>
        <Tooltip placement="left" title="AI Resume">
          <IconButton style={aiOpen ? { color: '#1890ff' } : undefined}>
            {getIcon('robot')}
          </IconButton>
        </Tooltip>
      </IconWrapper>
      <IconWrapper onClick={() => setSettingsOpen(true)}>
        <Tooltip placement="left" title="Settings">
          <IconButton>{getIcon('settings')}</IconButton>
        </Tooltip>
      </IconWrapper>
    </>
  );

  return (
    <Wrapper>
      <SideDrawer isShown={activeTab !== -1} width=''>
        {sideBarList[activeTab]?.component}
      </SideDrawer>
      <SideDrawer isShown={aiOpen} width='600px'>
        <AIResume onOpenSettings={openSettingsOnAITab} />
      </SideDrawer>
      <SideMenu menuList={sideBarList} onClick={clickHandler} bottomSlot={bottomSlot} activeKey={activeTab}>
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
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        defaultTab={settingsTab}
      />
      <SideBackground
        isShown={activeTab !== -1 || aiOpen}
        onDismiss={() => { setActiveTab(-1); setAiOpen(false); }}
      />
    </Wrapper>
  );
};
