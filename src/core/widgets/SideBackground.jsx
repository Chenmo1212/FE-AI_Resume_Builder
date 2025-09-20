import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  position: fixed;
  z-index: -1;
  top: 0;
  left: 0;

  &.hide {
    display: none;
  }
`;

export function SideBackground({ isShown, update }) {
  return <Wrapper className={isShown ? '' : 'hide'} onClick={() => update(-1)} />;
}
