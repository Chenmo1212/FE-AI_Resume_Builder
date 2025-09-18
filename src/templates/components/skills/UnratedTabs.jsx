import React from 'react';
import styled from 'styled-components';
import { Flex } from '../../../styles/styles';

const Badge = styled.span`
  padding: 4px;
  font-size: 98%;
  font-weight: 500;
  border: 1px solid ${(props) => props.theme.secondaryColor};
  border-radius: 4px;
`;

export function UnratedTabs({ items }) {
  return (
    <Flex cGap="5px" rGap="5px" style={{ flexWrap: 'wrap' }}>
      {items.map((value) => (
        <Badge key={value.name}>{value.name}</Badge>
      ))}
    </Flex>
  );
}
