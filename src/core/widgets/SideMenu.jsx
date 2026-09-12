import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { getIcon } from '../../styles/icons';

const Sider = styled.nav`
  height: 100%;
  font-size: 1.4rem;
  padding: 8px;
  background: #222;
  display: flex;
  flex-direction: column;
`;

const IconWrapper = styled.div`
  outline-color: transparent;
  margin-bottom: 1rem;
`;

const BottomSlot = styled.div`
  margin-top: auto;
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
  color: ${(props) => (props.$active ? '#1890ff' : 'rgb(230, 230, 230)')};

  &:disabled {
    color: rgb(128, 128, 128);
    cursor: not-allowed;
  }
`;

export const SideMenu = ({ children, menuList, onClick, bottomSlot, activeKey }) => (
  <Sider>
    {menuList.map((item) => (
      <IconWrapper key={item.key} data-id={item.key} onClick={onClick}>
        <Tooltip placement="left" title={item.title}>
          <IconButton disabled={item.disabled} $active={activeKey === item.key}>
            {getIcon(`${item.icon}`)}
          </IconButton>
        </Tooltip>
      </IconWrapper>
    ))}
    {children}
    {bottomSlot && <BottomSlot>{bottomSlot}</BottomSlot>}
  </Sider>
);