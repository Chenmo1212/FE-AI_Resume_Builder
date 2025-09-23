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
  // Filter valid profiles (those with URLs)
  const validProfiles = intro.profiles.filter((profile) => profile.url);
  const hasLessProfiles = validProfiles.length < 3;

  return (
    <FlexCol ai="center" style={{ textAlign: 'center' }}>
      <Name>{intro.name}</Name>
      
      {/* If 3 or more profiles, show them on a separate line */}
      {!hasLessProfiles && (
        <FlexHC cGap="0.5rem">
          {validProfiles.map((profile, index) => (
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
      )}
      
      {/* Contact information line, with profiles included if less than 3 */}
      <FlexHC cGap="10px">
        {/* If fewer than 3 profiles, show them first on this line */}
        {hasLessProfiles && validProfiles.length > 0 && (
          <>
            {validProfiles.map((profile, index) => (
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
            <span>|</span>
          </>
        )}
        
        <span>{intro.email}</span>
        <span>|</span>
        <span>{intro.phone}</span>
        <span>|</span>
        <span>{intro.location.address}</span>
      </FlexHC>
    </FlexCol>
  );
}
