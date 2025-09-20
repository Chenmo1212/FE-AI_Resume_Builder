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
import { EduSection } from '../components/education/SideEduSection';

const ResumeContainer = styled(Flex)`
  height: 100%;
  padding: 40px 25px;
  column-gap: 10px;
  color: ${(props) => props.theme.fontColor};
  background-color: ${(props) => props.theme.backgroundColor};

  @media print {
    border: none;
  }
`;

const LeftSection = styled(FlexCol)`
  flex-basis: 66%;
  row-gap: 20px;
  height: 100%;
`;

const RightSection = styled(FlexCol)`
  flex-basis: 34%;
  row-gap: 20px;
  height: 100%;
  justify-content: space-between;
`;

export default function ProfessionalTemplate() {
  // Column configuration
  const columnConfig = {
    left: ['intro', 'experience', 'projects'],
    right: ['summary', 'skills', 'practices', 'education', 'achievements', 'involvements', 'referral']
  };
  
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
  
  // Custom container renderer for two-column layout
  const renderContainer = (sections, components, baseTemplate) => {
    const { clickHandler, getIcon, labels, intro } = baseTemplate;
    
    // Filter sections by column
    const leftSections = sections.filter(section => 
      columnConfig.left.includes(section.id) && section.id !== 'intro'
    );
    
    const rightSections = sections.filter(section => 
      columnConfig.right.includes(section.id)
    );
    
    return (
      <ResumeContainer>
        <LeftSection>
          <ModernHeaderIntro title={intro.name} profiles={intro.profiles}>
            <div onClick={(e) => clickHandler(e, 'Intro')}>
              {components.renderIntro(intro, labels)}
            </div>
          </ModernHeaderIntro>
          
          {leftSections.map(section => (
            <ModernHeader 
              key={section.id}
              icon={getIcon(section.icon)}
              title={section.title}
              styles={section.id === 'experience' ? {flexGrow: 1} : {}}
            >
              {section.component({ ...components })}
            </ModernHeader>
          ))}
        </LeftSection>
        
        <RightSection>
          {rightSections.map(section => (
            <ModernHeader 
              key={section.id}
              icon={getIcon(section.icon)} 
              title={section.title}
            >
              {section.component({ ...components })}
            </ModernHeader>
          ))}
        </RightSection>
      </ResumeContainer>
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