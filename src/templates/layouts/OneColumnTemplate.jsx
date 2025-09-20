import React from 'react';
import styled from 'styled-components';
import { Flex, FlexCol } from '../../styles/styles';
import { BaseTemplate } from './BaseTemplate';
import { ModernHeader, ModernHeaderIntro } from '../components/section-layout/ModernHeader';
import { Intro } from '../components/intro/Intro';
import { Description } from '../components/description/Description';
import { Projects } from '../components/projects/Projects';
import { UnratedTabs } from '../components/skills/UnratedTabs';
import { Exp } from '../components/exp/Exp';
import { EduSection } from '../components/education/EduSection';

const ResumeContainer = styled(Flex)`
  height: 100%;
  padding: 40px 25px;
  color: ${(props) => props.theme.fontColor};
  background-color: ${(props) => props.theme.backgroundColor};

  @media print {
    border: none;
  }
`;

const Section = styled(FlexCol)`
  height: 100%;
  width: 100%;
  row-gap: 15px;
  justify-content: space-between;
`;

export default function OneColumnTemplate() {
  // Custom components
  const customComponents = {
    renderIntro: (intro, labels) => <Intro intro={intro} labels={labels} />,
    renderSummary: (summary, image) => <Description photo={image} description={summary} />,
    renderEducation: (education, config) => <EduSection education={education} config={config} />,
    renderExperience: (companies, config) => <Exp companies={companies} config={config} />,
    renderProjects: (projects) => <Projects projects={projects} />,
    renderSkills: (items) => <UnratedTabs items={items} />,
    renderPractices: (items) => <UnratedTabs items={items} />,
    renderAchievements: (description) => <Description description={description} />,
    renderInvolvements: (description) => <Description description={description} />,
    renderReferral: (description) => <Description description={description} />,
  };
  
  // Custom container renderer for one-column layout
  const renderContainer = (sections, components, baseTemplate) => {
    const { clickHandler, getIcon, labels, intro } = baseTemplate;
    
    // Filter out intro section as it's handled specially
    const contentSections = sections.filter(section => section.id !== 'intro');
    
    return (
      <ResumeContainer>
        <Section>
          <ModernHeaderIntro title={intro.name} profiles={intro.profiles}>
            <div onClick={(e) => clickHandler(e, 'Intro')}>
              {components.renderIntro(intro, labels)}
            </div>
          </ModernHeaderIntro>

          {contentSections.map(section => (
            <ModernHeader 
              key={section.id}
              icon={getIcon(section.icon)} 
              title={section.title}
            >
              {section.component({ ...components })}
            </ModernHeader>
          ))}
        </Section>
      </ResumeContainer>
    );
  };
  
  return (
    <BaseTemplate
      customComponents={customComponents}
      renderContainer={renderContainer}
    />
  );
}