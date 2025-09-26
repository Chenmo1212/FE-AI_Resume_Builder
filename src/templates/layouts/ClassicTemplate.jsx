import React from 'react';
import styled from 'styled-components';
import MarkdownIt from 'markdown-it';
import { FlexCol } from '../../styles/styles';
import { BaseTemplate } from './BaseTemplate';
import { Intro } from '../components/intro/Intro-Classic';
import { EduSection } from '../components/education/EduSection';
import { Exp } from '../components/exp/Exp';
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

const Divider = styled.div`
  height: 2px;
  background: #eee;
  margin: 5px 0;
`;

const mdParser = new MarkdownIt();

export default function ClassicTemplate() {
  // Custom components specific to this template
  const customComponents = {
    renderIntro: (intro) => <Intro intro={intro} />,
    renderSummary: (summary) => (
      <p dangerouslySetInnerHTML={{ __html: mdParser.render(summary) }} />
    ),
    renderEducation: (education, config) => (
      <EduSection education={education} config={config} noBorder={true} />
    ),
    renderExperience: (companies, config) => (
      <Exp companies={companies} config={config} isShowTimeline={false} />
    ),
    renderSkills: (items) => (
      <UnratedTabsText label="Technologies" items={items} />
    ),
    renderLanguages: (items) => (
      <UnratedTabsText label="Languages" items={items} />
    ),
    renderPractices: (items) => (
      <UnratedTabsText label="Methodologies" items={items} />
    ),
  };
  
  // Custom container renderer for this template
  const renderContainer = (sections, components, baseTemplate) => {
    const { intro, practices, languages } = baseTemplate;
    
    return (
      <ResumeContainer>
        {/* The intro component already has its own click handler */}
        {components.renderIntro(intro)}
        
        {/* Render other sections */}
        {sections
          .filter(section => section.id !== 'intro')
          .map(section => (
            <div key={section.id}>
              <SectionTitle onClick={(e) => baseTemplate.clickHandler(e, "Labels")}>{section.title}</SectionTitle>
              <div onClick={(e) => baseTemplate.clickHandler(e, section.navKey)}>
                {section.id === 'skills' ? (
                  <>
                    {languages.length > 0 ? (<>
                        {components.renderLanguages(languages)}
                        {section.component({ ...components })}
                      </>
                    ) : (
                      section.component({ ...components })
                    )}
                    {practices.length > 0 && components.renderPractices(practices)}
                  </>
                ) : (
                  section.component({ ...components })
                )}
              </div>
            </div>
          ))
        }
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