import React from 'react';
import styled from 'styled-components';
import { Flex } from '../../../styles/styles';

const Education = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.secondaryColor};
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
`;

const Institution = styled.div`
  font-weight: 500;
  font-size: 0.8rem;
`;

const Specialization = styled.div`
  font-weight: 400;
  font-size: 0.7rem;
`;

const Dissertation = styled.div`
  font-size: 0.65rem;
`;

const Courses = styled.div`
  font-size: 0.65rem;
`;

export function EduSection({ education }) {
  if (!education) return null;

  return education.map((data) => (
    <Education key={data.studyType}>
      <Flex jc="space-between">
        <Institution>{data.institution}</Institution>
        <em>
          {data.startDate} - {data.endDate}
        </em>
      </Flex>

      <Flex jc="space-between">
        <Specialization>{data.studyType} - {data.area}</Specialization>
        <em>{data.score}</em>
      </Flex>

      <Dissertation>{data.dissertation && <b>Dissertation:</b>} {data.dissertation}</Dissertation>
      <Courses>{data.courses && <b>Main Modules:</b>} {data.courses.join(', ')}</Courses>
    </Education>
  ));
}
