import React from 'react';
import styled from 'styled-components';
import { Timeline } from 'antd';
import { Flex } from '../../../styles/styles';
import MarkdownIt from 'markdown-it';
import { useWork } from '../../../stores/data.store';

const FlexTimeline = styled(Timeline)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
  padding-top: 15px;
  color: ${(props) => props.theme.fontColor};

  ul {
    padding-left: 16px;
    margin-bottom: 0;
    font-size: 0.8rem;
  }
`;

const TimelineItem = styled(FlexTimeline.Item)`
  padding-bottom: 0;
  flex-grow: 1;
  padding-bottom: 20px;

  :last-child {
    flex-grow: 0;
    padding-bottom: 0;
  }
`;

const CompanyName = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
`;

const CompanyRole = styled.div`
  font-weight: 500;
  font-size: 0.7rem;
  line-height: inherit;
`;

const CompanyExp = styled.div`
  font-style: italic;
  font-size: 0.7rem;
`;

const mdParser = new MarkdownIt(/* Markdown-it options */);

export function CompanyHeader({ company, workConfig }) {
  return (
    <>
      <Flex jc="space-between" ai="flex-end" style={{ lineHeight: 'initial' }}>
        <CompanyName>{company.name}</CompanyName>
        <CompanyExp>
          {company.startDate} - {company.endDate}
        </CompanyExp>
      </Flex>
      <Flex jc="space-between" ai="flex-end">
        <CompanyRole>{company.position}</CompanyRole>
        <CompanyExp>
          {workConfig.isShowLocation ? company.location : company.years}
        </CompanyExp>
      </Flex>
    </>
  );
}

export function Exp({ companies, styles }) {
  const workConfig = useWork((state) => state.workConfig);
  
  return (
    <FlexTimeline style={styles}>
      {companies.map((company, index) => (
        <TimelineItem key={`${company.name}-${index}`}>
          <CompanyHeader company={company} workConfig={workConfig} />
          <div dangerouslySetInnerHTML={{ __html: mdParser.render(company.summary ?? '') }} />
        </TimelineItem>
      ))}
    </FlexTimeline>
  );
}
