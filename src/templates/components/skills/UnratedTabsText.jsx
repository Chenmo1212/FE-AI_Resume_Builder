import React from 'react';
import styled from 'styled-components';
import { Flex } from '../../../styles/styles';

const Label = styled.span`
  font-weight: bold;
  display: contents;
`

export function UnratedTabsText({ items, label }) {
  return (
    <Flex cGap="5px" rGap="5px" style={{ flexWrap: 'wrap' }}>
      {label ? <Label>{label}: </Label> : null} {items.map((item) => item.name).join(', ')}
    </Flex>
  );
}
