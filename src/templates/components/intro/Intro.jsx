import React from 'react';
import Color from 'color';
import styled from 'styled-components';
import { Flex, FlexCol, FlexVC } from '../../../styles/styles';
import { getIcon } from '../../../styles/icons';

const Role = styled.h3`
  color: ${(props) => Color(props.theme.primaryColor).alpha(0.75).toString()};
  margin-bottom: 0;
  font-weight: 600;
`;

const Contact = ({ icon, value, href }) => (
  <FlexVC jc="flex-end" cGap="8px">
    {href ? (
      <a href={href}>
        {icon} &nbsp;<span>{value}</span>
      </a>
    ) : (
      <>
        {icon} <span>{value}</span>
      </>
    )}
  </FlexVC>
);

export function Intro({ intro, labels }) {
  return (
    <Flex jc="space-between">
      <FlexCol rGap="5px">
        <Role>{intro.label}</Role>
        {labels[10] && (
          <div>
            {labels[10]}:&nbsp;
            {intro.bio}
          </div>
        )}
        {labels[11] && (
          <div>
            {labels[11]}:&nbsp;{intro.totalExp}
          </div>
        )}
      </FlexCol>

      <FlexCol jc="flex-end" rGap="5px">
        <Contact icon={getIcon('mobile')} value={intro.phone} href={'tel:' + intro.phone}/>
        <Contact icon={getIcon('email')} value={intro.email} href={'mailto:' + intro.email}/>
        <Contact icon={getIcon('location')} value={intro.location.address} />
      </FlexCol>
    </Flex>
  );
}