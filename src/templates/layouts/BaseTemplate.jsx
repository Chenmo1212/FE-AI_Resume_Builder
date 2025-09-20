import React from 'react';
import { useBaseTemplate } from '../hooks/useBaseTemplate';
import { useTemplates } from '../../stores/templates.store';
import { Description } from '../components/description/Description';
import { Exp } from '../components/exp/Exp';
import { Projects } from '../components/projects/Projects';
import { EduSection } from '../components/education/EduSection';
import { UnratedTabs } from '../components/skills/UnratedTabs';
import { Intro } from '../components/intro/Intro';

export const BaseTemplate = ({
  children,
  renderContainer,
  sectionOrder: defaultSectionOrder,
  columnConfig,
  customComponents = {},
  customStyles = {}
}) => {
  // Get section order from the store - this will already be filtered by visibility
  const getSectionOrder = useTemplates(state => state.getSectionOrder);
  const storeSectionOrder = getSectionOrder();
  
  // Use store section order if available, otherwise use the default provided
  const sectionOrder = storeSectionOrder || defaultSectionOrder;
  
  // Get all the shared functionality
  const baseTemplate = useBaseTemplate(sectionOrder);
  
  // Default component renderers
  const defaultComponents = {
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
  
  // Merge base components with custom components
  const components = {
    ...defaultComponents,
    ...customComponents
  };
  
  // Default container renderer
  const defaultRenderContainer = (sections) => (
    <div className="resume-container" style={{ 
      padding: '30px 25px',
      color: 'var(--font-color)',
      backgroundColor: 'var(--background-color)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      rowGap: '10px',
      ...customStyles.container
    }}>
      {sections.map(section => (
        <div key={section.id} className="resume-section" style={customStyles.section} id={section.id}>
          <h2 style={{ 
            fontSize: '1rem',
            fontWeight: 700,
            borderBottom: '1px solid #000',
            ...customStyles.sectionTitle
          }}>{section.title}</h2>
          {section.component({ ...components })}
        </div>
      ))}
    </div>
  );
  
  // Use custom container renderer or default
  const containerRenderer = renderContainer || defaultRenderContainer;
  
  // Get ordered sections
  const sections = baseTemplate.getOrderedSections();
  
  // Render the template
  return (
    <>
      {containerRenderer(sections, components, baseTemplate)}
      {children}
    </>
  );
};