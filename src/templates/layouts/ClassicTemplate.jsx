import React from 'react';
import shallow from 'zustand/shallow';
import styled from 'styled-components';
import MarkdownIt from 'markdown-it';
import { FlexCol } from '../../styles/styles';
import {
  useIntro,
  useWork,
  useSkills,
  useActivities,
  useEducation,
  useLabels,
  useProjects,
} from '../../stores/data.store';
import { useLeftDrawer } from '../../stores/settings.store';
import { leftNavList } from '../../core/containers/LeftNav';
import { Intro } from '../components/intro/Intro-Classic';
import { EduSection } from '../components/education/EduSection';
import { Exp } from '../components/exp/Exp';
import { Projects } from '../components/projects/Projects';
import { Description } from '../components/description/Description';
import { UnratedTabsText } from '../components/skills/UnratedTabsText';

// Components for the Classic Template
const ResumeContainer = styled(FlexCol)`
  height: 100%;
  padding: 30px 25px;
  row-gap: 10px;
  color: ${(props) => props.theme.fontColor};
  background-color: ${(props) => props.theme.backgroundColor};
  font-size: 0.65rem;

  @media print {
    border: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  border-bottom: 1px solid #000;
`;

const mdParser = new MarkdownIt();

export default function ClassicTemplate() {
  const intro = useIntro((state) => state.intro);
  const [education, eduConfig] = useEducation((state) => [state.education, state.eduConfig], shallow);
  const [companies, workConfig] = useWork((state) => [state.companies, state.workConfig], shallow);
  const projects = useProjects((state) => state.projects);
  const [achievements] = useActivities((state) => [state.achievements], shallow);
  const labels = useLabels((state) => state.labels);
  const setLeftDrawer = useLeftDrawer((state) => state.update);
  const [languages, frameworks, libraries, databases, technologies, practices, tools] = useSkills(
    (state) => [
      state.languages,
      state.frameworks,
      state.libraries,
      state.databases,
      state.technologies,
      state.practices,
      state.tools,
    ],
    shallow
  );

  const clickHandler = (e, type) => {
    let navIndex = -1;
    if (e.detail === 2) {
      switch (type) {
        case labels[5]:
        case labels[6]:
        case labels[7]:
        case labels[8]:
          navIndex = leftNavList.findIndex((e) => e.title === 'Skills');
          break;
        case labels[1]:
        case labels[2]:
          navIndex = leftNavList.findIndex((e) => e.title === 'Activities');
          break;
        case labels[3]:
        case labels[4]:
          navIndex = leftNavList.findIndex((e) => e.title === 'Intro');
          break;
        default:
          navIndex = leftNavList.findIndex((e) => e.title === type);
      }
      setLeftDrawer(navIndex.toString());
    }
  };

  return (
    <ResumeContainer>
      {/* Header with Name and Contact Info */}
      <Intro intro={intro} />

      {/* Summary Section */}
      {intro.summary && (
        <div onClick={(e) => clickHandler(e, 'Intro')}>
          <SectionTitle>{labels[3]}</SectionTitle>
          <p dangerouslySetInnerHTML={{ __html: mdParser.render(intro.summary) }} />
        </div>
      )}

      {/* Education Section */}
      <div onClick={(e) => clickHandler(e, labels[9])}>
        <SectionTitle>{labels[9]}</SectionTitle>
        <EduSection education={education} config={eduConfig} noBorder={true}/>
      </div>

      {/* Experience Section */}
      <div onClick={(e) => clickHandler(e, labels[0])}>
        <SectionTitle>{labels[0]}</SectionTitle>
        <Exp companies={companies} workConfig={workConfig} isShowTimeline={false}/>
      </div>

      {/* Projects Section */}
      <div onClick={(e) => clickHandler(e, labels[1])}>
        <SectionTitle>{labels[1]}</SectionTitle>
        <Projects projects={projects}/>
      </div>

      {/* Achievements Section */}
      <div onClick={(e) => clickHandler(e, labels[2])}>
        <SectionTitle>{labels[2]}</SectionTitle>
        <Description description={achievements} />
      </div>

      {/* Skills Section */}
      <div onClick={(e) => clickHandler(e, labels[5])}>
        <SectionTitle>{labels[5]}</SectionTitle>
        <UnratedTabsText
          label="Skills"
          items={[
            ...languages,
            ...frameworks,
            ...libraries,
            ...databases,
            ...tools,
            ...technologies,
          ]}
        />
        <UnratedTabsText
          label="Methodologies"
          items={[...practices]}
        />
      </div>
    </ResumeContainer>
  );
}