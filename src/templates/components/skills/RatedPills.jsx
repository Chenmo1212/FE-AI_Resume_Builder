import React from 'react';
import styled from 'styled-components';
import { FlexCol, FlexVC } from '../../../styles/styles';

const RatedType = styled.div`
  width: 15ch;
  font-weight: 600;
`;

const RatingTablet = styled.span`
  width: 16px;
  height: 8px;
  border-radius: 25%;
  display: inline-block;
  border: 0.5px solid ${(props) => props.theme.secondaryColor};
  margin: 0px 4px;
  background-color: ${(props) => (props.filled ? props.theme.secondaryColor : 'transparent')};
`;

function RatedPillElement({ itemLabel, itemRating, index }) {
  const tablets = [];
  for (let i = 1; i <= 5; i += 1) {
    tablets.push(
      <RatingTablet data-index={index} data-rating={i} filled={i <= itemRating} key={i} />
    );
  }

  return (
    <FlexVC>
      <RatedType>{itemLabel}</RatedType>
      {tablets}
    </FlexVC>
  );
}

export function RatedPill({ items }) {
  return (
    <FlexCol rGap="8px">
      {items.map((data, index) => (
        <RatedPillElement
          itemLabel={data.name}
          itemRating={data.level}
          key={data.name}
          index={index}
        />
      ))}
    </FlexCol>
  );
}
