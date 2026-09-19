import React from 'react';
import styled from 'styled-components';
import { Flex } from 'src/styles/styles';

const Education = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.secondaryColor};
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
`;

const Institution = styled.div`
  font-weight: 500;
  font-size: var(--fs-md);
`;

const Specialization = styled.div`
  font-weight: 400;
  font-size: var(--fs-sm);
`;

const Dissertation = styled.div`
  font-size: var(--fs-base);
`;

const Courses = styled.div`
  font-size: var(--fs-base);
`;

export function EduSection({ education }: any) {
  if (!education) return null;

  return education.map((data: any) => (
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

      {data.dissertation ? <Dissertation><b>Dissertation:</b> {data.dissertation}</Dissertation> : null}
      {data.courses?.length ? <Courses><b>Main Modules:</b> {data.courses.join(', ')}</Courses> : null}
    </Education>
  ));
}
