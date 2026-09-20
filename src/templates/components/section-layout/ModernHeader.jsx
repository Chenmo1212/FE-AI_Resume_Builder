import React from 'react';
import styled from 'styled-components';
import Color from 'color';
import { Flex, FlexHVC } from '../../../styles/styles';
import { getIcon } from '../../../styles/icons';

const SectionHolder = styled.div`
  border: 1px solid ${(props) => Color(props.theme.fontColor).alpha(0.25).toString()};
  border-radius: 5px;
  padding: 10px 10px 10px 10px;
  position: relative;

  .header {
    /* Keep element in normal DOM flow (ATS reads title before body),
       but use negative margin-top to pull it up over the border visually. */
    display: flex;
    align-items: center;
    width: fit-content;
    margin-top: -20px;
    margin-bottom: 6px;
    background: ${(props) => props.theme.backgroundColor};
    padding: 0 5px;
    font-weight: bold;
    color: ${(props) => props.theme.primaryColor};

    svg {
      font-size: var(--fs-md);
    }
  }
`;

const SectionIntroHolder = styled(SectionHolder)`
  padding-top: 0px;

  .header {
    display: inline-block;
    width: fit-content;
    margin-top: -20px;
    margin-bottom: 6px;
    margin-left: 5px;
    padding: 0 5px;
    background: ${(props) => props.theme.backgroundColor};

    .header__title {
      margin: 0;
      color: ${(props) => props.theme.primaryColor};
    }
  }

  .social-icons {
    position: absolute;
    top: -12px;
    right: 10px;
    font-size: var(--fs-lg);
    column-gap: 5px;

    svg {
      color: ${(props) => props.theme.primaryColor};
      background-color: ${(props) => props.theme.backgroundColor};
    }
  }
`;

export function ModernHeader({ styles, title, icon, children }) {
  return (
    <SectionHolder style={styles}>
      {/* Header is first in DOM so ATS reads the section title before its content */}
      <FlexHVC className="header" cGap="5px">
        {icon}
        <div className="header__title">{title}</div>
      </FlexHVC>
      {children}
    </SectionHolder>
  );
}

export function ModernHeaderIntro({
  styles,
  title,
  profiles,
  children,
  displaySocial = true,
}) {
  return (
    <SectionIntroHolder style={styles}>
      {/* Name heading is first in DOM — ATS reads name before job title / contact */}
      <div className="header">
        <h1 className="header__title">{title}</h1>
      </div>
      {displaySocial ? (
        <Flex className="social-icons">
          {profiles
            .filter((profile) => profile.url)
            .map((profile) => (
              <a href={profile.url} key={profile.url}>
                {getIcon(profile.network)}
              </a>
            ))}
        </Flex>
      ) : null}

      {children}
    </SectionIntroHolder>
  );
}
