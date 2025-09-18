import React from 'react';
import styled from 'styled-components';
import { Flex } from '../../../styles/styles';
import MarkdownIt from 'markdown-it';

const Education = styled.div`
    &:not(:last-child) {
        border-bottom: 1px solid ${(props) => props.theme.secondaryColor};
        padding-bottom: 10px;
        margin-bottom: 10px;
    }
`;

const Institution = styled.div`
    font-size: 0.6rem;
`;

const Specialization = styled.div`
    font-weight: 700;
    font-size: 0.7rem;
`;

const Highlights = styled.div`
    font-size: 0.65rem;
`;

const Topic = styled.div`
    font-size: 0.65rem;
`;

const Year = styled.div`
    min-width: 3.8rem;
`;

const mdParser = new MarkdownIt(/* Markdown-it options */);

export function EduSection({ education, config }) {
  if (!education) return null;

  return education.map((data) => (
    <Education key={data.studyType}>
      <Flex jc="space-between">
        <Specialization>{data.studyType}</Specialization>
        <Year>
          {data.startDate}-{data.endDate}
        </Year>
      </Flex>
      <Topic>{data.area}</Topic>
      <Institution>{data.institution}</Institution>

      {/* Config */}
      {config.isShowCourses && (data.courses && data.courses.length) ? <Topic><b>Main Modules:</b> {data.courses}</Topic> : ""}
      {config.isShowDissertation && data.dissertation ? <Topic><b>Dissertation:</b> {data.dissertation}</Topic> : ""}
      {config.isShowHighlights && data.highlights && <Highlights>
        <b>Highlights:</b>
        <div dangerouslySetInnerHTML={{ __html: mdParser.render(data.highlights ?? '') }} />
      </Highlights>
      }
    </Education>
  ));
}
