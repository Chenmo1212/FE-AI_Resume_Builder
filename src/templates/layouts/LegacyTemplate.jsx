import React from 'react';
import shallow from 'zustand/shallow';
import styled from 'styled-components';
import { getIcon } from '../../styles/icons';

import { Intro } from '../components/intro/Intro';
import { Description } from '../components/description/Description';
import { RatedPill } from '../components/skills/RatedPills';
import { UnratedTabs } from '../components/skills/UnratedTabs';
import { Exp } from '../components/exp/Exp';
import { Projects } from '../components/projects/Projects';
import { EduSection } from '../components/education/EduSection';
import { LineSeparator } from '../components/separator/LineSeparator';
import { LegacyHeader } from '../components/section-layout/LegacyHeader';
import { SocialBar } from '../components/social/SocialBar';
import {
  useIntro,
  useWork,
  useSkills,
  useActivities,
  useEducation,
  useLabels, useProjects,
} from '../../stores/data.store';
import { useLeftDrawer } from '../../stores/settings.store';
import { leftNavList } from '../../core/containers/LeftNav';

const GridContainer = styled.div`
  margin: auto;
  display: grid;
  padding: 40px 25px;
  grid-template-columns: 68% 10px 1fr;
  color: ${(props) => props.theme.fontColor};
  background-color: ${(props) => props.theme.backgroundColor};
`;

const Divider = styled.div`
  height: 100%;
  width: 2px;
  background-color: #007bff;
`;

const GridColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:first-child {
    padding-right: 10px;
  }
`;

const EmployeName = styled.div`
  margin: 0;
  color: ${(props) => props.theme.primaryColor};
  font-size: 1.5rem;
`;

export default function LegacyTemplate() {
  const intro = useIntro((state) => state.intro);
  const [education, eduConfig] = useEducation((state) => [state.education, state.eduConfig], shallow);
  const [companies, workConfig] = useWork((state) => [state.companies, state.workConfig], shallow);
  const [projects] = useProjects((state) => [state.projects], shallow);
  const [achievements] = useActivities((state) => [state.achievements], shallow);
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

  const labels = useLabels((state) => state.labels);

  const setLeftDrawer = useLeftDrawer((state) => state.update);

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
    <GridContainer>
      <GridColumn>
        <div onClick={(e) => clickHandler(e,'Intro')}>
          <EmployeName>{intro.name}</EmployeName>
          <Intro intro={intro} labels={labels} />
          <SocialBar profiles={intro.profiles} />
        </div>

        <div onClick={(e) => clickHandler(e, labels[0])}>
          <LegacyHeader Icon={getIcon('work')} title={labels[0]} />
          <Exp companies={companies} workConfig={workConfig} />
        </div>

        {/* Projects */}
        {projects.length > 0 ? (
          <div onClick={(e) => clickHandler(e, labels[1])}>
            <LineSeparator />
            <LegacyHeader Icon={getIcon('key')} title={labels[1]} />
            <Projects projects={projects} />
          </div>
        ) : ""}

        {/* Achievements */}
        {achievements ? (
          <div onClick={(e) => clickHandler(e, labels[2])}>
            <LineSeparator />
            <LegacyHeader Icon={getIcon('certificate')} title={labels[2]} />
            <Description description={achievements} />
          </div>
        ) : ""}
      </GridColumn>

      <Divider />

      <GridColumn>
        {/* Summary */}
        {intro.summary ? (
          <>
            <div onClick={(e) => clickHandler(e, labels[3])}>
              <LegacyHeader Icon={getIcon('identity')} title={labels[3]} />
              <Description description={intro.summary} />
            </div>
            <LineSeparator />
          </>
        ) : ""}

        {/* Expert */}
        {[...languages, ...frameworks].length > 0 ? (
          <>
          <div onClick={(e) => clickHandler(e, labels[5])}>
            <LegacyHeader Icon={getIcon('expert')} title={labels[5]} />
            <RatedPill items={[...languages, ...frameworks]} />
          </div>
          <LineSeparator />
          </>
        ) : ""}

        <>
          <div onClick={(e) => clickHandler(e, labels[6])}>
            <LegacyHeader Icon={getIcon('skill')} title={labels[6]} />
            <UnratedTabs items={[...technologies, ...libraries, ...databases]} />
          </div>
          <LineSeparator />
        </>

        {/* Practices */}
        <>
          <div onClick={(e) => clickHandler(e, labels[7])}>
            <LegacyHeader Icon={getIcon('branch')} title={labels[7]} />
            <UnratedTabs items={practices} />
          </div>
          <LineSeparator />
        </>

        {/* Tool */}
        {tools.length > 0 ? (
          <>
          <div onClick={(e) => clickHandler(e, labels[7])}>
            <LegacyHeader Icon={getIcon('tool')} title={labels[8]} />
            <UnratedTabs items={tools} />
            <LineSeparator />
          </div>
          </>
        ) : ""}

        <div onClick={(e) => clickHandler(e, labels[9])}>
          <LegacyHeader Icon={getIcon('education')} title={labels[9]} />
          <EduSection education={education} config={eduConfig}/>
        </div>
      </GridColumn>
    </GridContainer>
  );
}
