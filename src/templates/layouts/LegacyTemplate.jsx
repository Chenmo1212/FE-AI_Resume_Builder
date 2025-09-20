import React from 'react';
import styled from 'styled-components';
import { BaseTemplate } from './BaseTemplate';
import { Intro } from '../components/intro/Intro';
import { Description } from '../components/description/Description';
import { RatedPill } from '../components/skills/RatedPills';
import { UnratedTabs } from '../components/skills/UnratedTabs';
import { Exp } from '../components/exp/Exp';
import { Projects } from '../components/projects/Projects';
import { EduSection } from '../components/education/SideEduSection';
import { LineSeparator } from '../components/separator/LineSeparator';
import { LegacyHeader } from '../components/section-layout/LegacyHeader';
import { SocialBar } from '../components/social/SocialBar';

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
  // Column configuration
  const columnConfig = {
    left: ['intro', 'experience', 'projects', 'achievements', 'involvements'],
    right: ['summary', 'skills', 'practices', 'tools', 'education', 'referral']
  };
  
  // Custom components
  const customComponents = {
    renderIntro: (intro, labels) => (
      <>
        <EmployeName>{intro.name}</EmployeName>
        <Intro intro={intro} labels={labels} />
        <SocialBar profiles={intro.profiles} />
      </>
    ),
    renderSummary: (summary) => <Description description={summary} />,
    renderEducation: (education, config) => <EduSection education={education} config={config} />,
    renderExperience: (companies, config) => <Exp companies={companies} config={config} />,
    renderProjects: (projects) => <Projects projects={projects} />,
    renderSkills: (items) => <UnratedTabs items={items} />,
    renderPractices: (items) => <UnratedTabs items={items} />,
    renderTools: (items) => <UnratedTabs items={items} />,
    renderAchievements: (description) => <Description description={description} />,
    renderInvolvements: (description) => <Description description={description} />,
    renderReferral: (description) => <Description description={description} />,
    renderExpertSkills: (items) => <RatedPill items={items} />,
  };
  
  // Custom container renderer for grid layout
  const renderContainer = (sections, components, baseTemplate) => {
    const { clickHandler, getIcon, labels, intro, languages, frameworks, tools } = baseTemplate;
    
    // Filter sections by column
    const leftSections = sections.filter(section => 
      columnConfig.left.includes(section.id) && section.id !== 'intro'
    );
    
    const rightSections = sections.filter(section => 
      columnConfig.right.includes(section.id)
    );
    
    return (
      <GridContainer>
        <GridColumn>
          {components.renderIntro(intro, labels)}

          {leftSections.map((section, index) => (
            <React.Fragment key={section.id}>
              {index > 0 && <LineSeparator />}
              <LegacyHeader Icon={getIcon(section.icon)} title={section.title} />
              {section.component({ ...components })}
            </React.Fragment>
          ))}
        </GridColumn>

        <Divider />

        <GridColumn>
          {/* Special handling for summary with separator */}
          {rightSections.find(s => s.id === 'summary') && (
            <>
              <div onClick={(e) => clickHandler(e, labels[3])}>
                <LegacyHeader Icon={getIcon('identity')} title={labels[3]} />
                {components.renderSummary(intro.summary)}
              </div>
              <LineSeparator />
            </>
          )}

          {/* Special handling for expert skills */}
          {[...languages, ...frameworks].length > 0 && (
            <>
              <div onClick={(e) => clickHandler(e, labels[5])}>
                <LegacyHeader Icon={getIcon('expert')} title={labels[5]} />
                {components.renderExpertSkills([...languages, ...frameworks])}
              </div>
              <LineSeparator />
            </>
          )}

          {/* Special handling for tools */}
          {tools.length > 0 && (
            <>
              <div onClick={(e) => clickHandler(e, labels[8])}>
                <LegacyHeader Icon={getIcon('tool')} title={labels[8]} />
                {components.renderTools(tools)}
              </div>
              <LineSeparator />
            </>
          )}

          {/* Render other right sections */}
          {rightSections
            .filter(section => section.id !== 'summary')
            .map((section, index) => (
              <React.Fragment key={section.id}>
                <LegacyHeader Icon={getIcon(section.icon)} title={section.title} />
                {section.component({ ...components })}
                {index < rightSections.length - 2 && <LineSeparator />}
              </React.Fragment>
            ))}
        </GridColumn>
      </GridContainer>
    );
  };
  
  return (
    <BaseTemplate
      columnConfig={columnConfig}
      customComponents={customComponents}
      renderContainer={renderContainer}
    />
  );
}