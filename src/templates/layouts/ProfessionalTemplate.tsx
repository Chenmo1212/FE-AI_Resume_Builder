import React from 'react';
import shallow from 'zustand/shallow';
import styled from 'styled-components';
import { Flex, FlexCol } from 'src/styles/styles';
import { getIcon } from 'src/styles/icons';
import {
  ModernHeader,
  ModernHeaderIntro,
} from 'src/templates/components/section-layout/ModernHeader';
import { Intro } from 'src/templates/components/intro/Intro';
import { Description } from 'src/templates/components/description/Description';
import { Projects } from 'src/templates/components/projects/Projects';
import { RatedBars } from 'src/templates/components/skills/RatedBars';
import { UnratedTabs } from 'src/templates/components/skills/UnratedTabs';
import { Exp } from 'src/templates/components/exp/Exp';
import { EduSection } from 'src/templates/components/education/EduSection';
import {
  useIntro,
  useWork,
  useSkills,
  useActivities,
  useEducation,
  useLabels,
  useProjects,
} from 'src/stores/data.store';
import { useLeftDrawer } from 'src/stores/settings.store';
import { leftNavList } from 'src/core/containers/LeftNav';

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

const labelsIcon = [
  'work',
  'key',
  'certificate',
  'identity',
  'career',
  'expert',
  'skill',
  'branch',
  'tool',
  'education',
];

export default function ProfessionalTemplate() {
  const intro = useIntro((state: any) => state.intro);
  const education = useEducation((state: any) => state.education);
  const experience = useWork((state: any) => state);
  const projects = useProjects((state: any) => state);
  const [achievements] = useActivities((state: any) => [state.achievements], shallow);
  const [languages, frameworks, libraries, databases, technologies, practices, tools] = useSkills(
    (state: any) => [
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
  const labels = useLabels((state: any) => state.labels);

  const setLeftDrawer = useLeftDrawer((state: any) => state.update);

  const clickHandler = (e: { detail: number }, type) => {
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

  const leftSections = [
    {
      title: labels[0],
      icon: labelsIcon[0],
      component: (
        <div onClick={(e) => clickHandler(e, labels[0])}>
          <Exp companies={experience.companies} />
        </div>
      ),
      styles: { flexGrow: 1 },
    },
    {
      title: labels[1],
      icon: labelsIcon[1],
      component: (
        <div onClick={(e) => clickHandler(e, labels[1])}>
          <Projects projects={projects.projects} />
        </div>
      ),
    },
  ];
  const rightSections = [
    {
      title: labels[3],
      icon: labelsIcon[3],
      component: (
        <div onClick={(e) => clickHandler(e, labels[3])}>
          <Description photo={intro.image} description={intro.summary} />
        </div>
      ),
    },
    {
      title: labels[6],
      icon: labelsIcon[6],
      component: (
        <div onClick={(e) => clickHandler(e, labels[6])}>
          <UnratedTabs items={[...technologies, ...libraries, ...databases]} />
        </div>
      ),
    },
    {
      title: labels[7],
      icon: labelsIcon[7],
      component: (
        <div onClick={(e) => clickHandler(e, labels[7])}>
          <UnratedTabs items={practices} />
        </div>
      ),
    },
    {
      title: labels[9],
      icon: labelsIcon[9],
      component: (
        <div onClick={(e) => clickHandler(e, labels[9])}>
          <EduSection education={education} />
        </div>
      ),
    },
    {
      title: labels[2],
      icon: labelsIcon[2],
      component: (
        <div onClick={(e) => clickHandler(e, labels[2])}>
          <Description description={achievements} />
        </div>
      ),
    },
  ];

  return (
    <ResumeContainer>
      <LeftSection>
        <ModernHeaderIntro title={intro.name} profiles={intro.profiles}>
          <div onClick={(e) => clickHandler(e, 'Intro')}>
            <Intro intro={intro} labels={labels} />
          </div>
        </ModernHeaderIntro>

        {leftSections
          .filter(({ title }) => !!title)
          .map(({ title, icon, component, styles }) => (
            <ModernHeader icon={getIcon(icon)} title={title} styles={styles} key={title}>
              {component}
            </ModernHeader>
          ))}
      </LeftSection>

      <RightSection>
        {rightSections
          .filter(({ title }) => !!title)
          .map(({ title, icon, component }) => (
            <ModernHeader icon={getIcon(icon)} title={title} key={title}>
              {component}
            </ModernHeader>
          ))}
      </RightSection>
    </ResumeContainer>
  );
}
