import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import { SaveSettings } from '../widgets/SaveSettings';
import { UploadSettings } from '../widgets/UploadSettings';
import { Tooltip } from 'antd';
import { SideBackground } from '../widgets/SideBackground';
import { Templates } from '../components/templates/Templates';
import { Themes } from '../components/themes/Themes';
import { AIResume } from '../widgets/AIResume';
import { useRightDrawer, useFontSize } from '../../stores/settings.store';
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

const fadeOut = keyframes`
  0%   { opacity: 1; }
  70%  { opacity: 1; }
  100% { opacity: 0; }
`;

const FontSizeToast = styled.div`
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: rgba(30, 30, 30, 0.82);
  color: #fff;
  font-size: 13px;
  font-family: -apple-system, 'Segoe UI', system-ui, sans-serif;
  letter-spacing: 0.02em;
  padding: 7px 14px;
  border-radius: 6px;
  pointer-events: none;
  z-index: 9999;
  animation: ${fadeOut} 1.8s ease forwards;

  @media print {
    display: none;
  }
`;

export const Sidebar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('ai');
  const [activeTab, setActiveTab] = useRightDrawer((state) => [state.activeTab, state.update]);
  const [aiOpen, setAiOpen] = useState(false);
  const { scale: fontScale, increase: increaseFontSize, decrease: decreaseFontSize } = useFontSize();
  const [toastKey, setToastKey] = useState(null);
  const toastTimerRef = useRef(null);

  const openSettingsOnAITab = () => {
    setSettingsTab('ai');
    setSettingsOpen(true);
  };

  const triggerToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastKey(Date.now());
    toastTimerRef.current = setTimeout(() => setToastKey(null), 1800);
  }, []);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const handleIncrease = useCallback(() => { increaseFontSize(); triggerToast(); }, [increaseFontSize, triggerToast]);
  const handleDecrease = useCallback(() => { decreaseFontSize(); triggerToast(); }, [decreaseFontSize, triggerToast]);

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
        <IconWrapper onClick={handleIncrease}>
          <Tooltip placement="left" title={'Increase font size'}>
            <IconButton>{getIcon('fontsize-increase')}</IconButton>
          </Tooltip>
        </IconWrapper>

        <IconWrapper onClick={handleDecrease}>
          <Tooltip placement="left" title={'Decrease font size'}>
            <IconButton>{getIcon('fontsize-decrease')}</IconButton>
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
      {toastKey && (
        <FontSizeToast key={toastKey}>
          Font Size {Math.round(fontScale * 100)}%
        </FontSizeToast>
      )}
    </Wrapper>
  );
};
