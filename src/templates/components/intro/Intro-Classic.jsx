import React from 'react';
import styled from 'styled-components';
import { FlexCol, FlexVC, FlexHC } from '../../../styles/styles';
import { getIcon } from '../../../styles/icons';

const Name = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  font-weight: bold;
`;

export function Intro({ intro }) {
  return (
    <FlexCol ai="center" style={{ textAlign: 'center' }}>
      <Name>{intro.name}</Name>
      <FlexHC cGap="0.5rem">
        {intro.profiles
          .filter((profile) => profile.url)
          .map((profile, index) => (
            <React.Fragment key={profile.network + index}>
              {index > 0 && <span>|</span>}
              <FlexVC style={{ display: 'inline-flex' }}>
                {getIcon(profile.network)} :&nbsp;
                <a href={profile.url}>
                  {profile.username}
                </a>
              </FlexVC>
            </React.Fragment>
          ))}
      </FlexHC>
      <FlexHC cGap="10px">
        <span>{intro.email}</span>
        <span>|</span>
        <span>{intro.phone}</span>
        <span>|</span>
        <span>{intro.location.address}</span>
      </FlexHC>
    </FlexCol>
  );
}