import React from 'react';
import styled from 'styled-components';
import { FlexCol, Flex } from '../../../styles/styles';
import MarkdownIt from 'markdown-it';

const Education = styled.div`
    &:not(:last-child) {
        ${props => !props.noBorder && `
          border-bottom: 1px solid ${props.theme.secondaryColor};
          padding-bottom: 10px;
          margin-bottom: 10px;
        `}
        gap: 1rem;
    }
`;

const Institution = styled.div`
    font-weight: 700;
    font-size: 0.7rem;
`;

const Specialization = styled.div`
    font-weight: 400;
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

export function EduSection({ education, config, noBorder = false }) {
  if (!education) return null;
  return (
    <FlexCol rGap="0.3rem">
      {education.map((data) => (
        <Education key={data.studyType} noBorder={noBorder}>
          <Flex jc="space-between">
            <Institution>{data.institution}</Institution>
            <Year>
              {data.startDate}-{data.endDate}
            </Year>
          </Flex>

          <Flex jc="space-between">
            <Specialization>{data.studyType} - {data.area}</Specialization>
            <em>{data.score}</em>
          </Flex>

          {/* Config */}
          {config.isShowCourses && (data.courses && data.courses.length) ? <Topic><b>Main Modules:</b> {data.courses}</Topic> : ""}
          {config.isShowDissertation && data.dissertation ? <Topic><b>Dissertation:</b> {data.dissertation}</Topic> : ""}
          {config.isShowHighlights && data.highlights && <Highlights>
            <b>Highlights:</b>
            <div dangerouslySetInnerHTML={{ __html: mdParser.render(data.highlights ?? '') }} />
          </Highlights>
          }
        </Education>
      ))}
    </FlexCol>
  )
}
