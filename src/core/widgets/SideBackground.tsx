import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLeftDrawer } from 'src/stores/settings.store';

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;

  &.hide {
    display: none;
  }
`;

export function SideBackground({ isShown }: any) {
  const setLeftDrawer = useLeftDrawer((state: any) => state.update);
  return <Wrapper className={isShown ? '' : 'hide'} onClick={() => setLeftDrawer(-1)} />;
}
