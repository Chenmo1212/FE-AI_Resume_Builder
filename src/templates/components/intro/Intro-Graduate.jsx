import React from 'react';
import Color from 'color';
import styled from 'styled-components';
import { Flex, FlexCol, FlexVC } from '../../../styles/styles';
import { getIcon } from '../../../styles/icons';

const Role = styled.h3`
  color: ${(props) => Color(props.theme.primaryColor).alpha(0.75).toString()};
  margin-bottom: 0;
  font-weight: 600;
  font-size: 0.8rem;
`;

const Contact = ({ icon, value }) => (
  <FlexVC jc="flex-start" cGap="8px">
    {icon} <span>{value}</span>
  </FlexVC>
);

const MailContact = ({ icon, value }) => (
  <FlexVC jc="flex-start" cGap="8px">
    <a href={'mailto:' + value}>
      {icon} &nbsp;<span>{value}</span>
    </a>
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
        <Contact icon={getIcon('mobile')} value={intro.phone} />
        <MailContact icon={getIcon('email')} value={intro.email} />
        <Contact icon={getIcon('location')} value={intro.location.address} />
      </FlexCol>
    </Flex>
  );
}