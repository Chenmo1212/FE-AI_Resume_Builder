import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: #222;
  padding: 0.25rem 0.25rem 0.25rem 1rem;
  height: 100%;
`;

const Wrapper = styled.div`
  height: 100vh;
  overflow-y: auto;
  background: #222;
  width: ${(props) => props.width || '380px'};

  &.hide {
    display: none;
  }
`;

export function SideDrawer({ isShown, width, children }) {
  return (
    <Wrapper className={isShown ? '' : 'hide'} width={width}>
      <Container>{children}</Container>
    </Wrapper>
  );
}
