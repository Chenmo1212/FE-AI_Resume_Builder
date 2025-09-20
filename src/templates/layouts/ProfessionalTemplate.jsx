import React from 'react';
import shallow from 'zustand/shallow';
import styled from 'styled-components';
import {
  ModernHeader,
  ModernHeaderIntro,
} from '../components/section-layout/ModernHeader';
import { Intro } from '../components/intro/Intro';
import { Description } from '../components/description/Description';
import { Projects } from '../components/projects/Projects';
import { UnratedTabs } from '../components/skills/UnratedTabs';
import { Exp } from '../components/exp/Exp';
import { EduSection } from '../components/education/SideEduSection';
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
import { Flex, FlexCol } from '../../styles/styles';
import { getIcon } from '../../styles/icons';
import { useTemplates } from '../../stores/templates.store';

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
  const intro = useIntro((state) => state.intro);
  const [education] = useEducation((state) => [state.education], shallow);
  const [companies] = useWork((state) => [state.companies], shallow);
  const projects = useProjects((state) => state.projects);
  const [involvements, achievements] = useActivities((state) => [state.involvements, state.achievements], shallow);
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
  const config = useTemplates((state) => state.currConfig());
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

  const leftSections = [
    {
      title: labels[0],
      icon: labelsIcon[0],
      isShow: config.isShowExp && companies.length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[0])}>
          <Exp companies={companies} config={config} />
        </div>
      ),
      styles: { flexGrow: 1 },
    },
    {
      title: labels[1],
      icon: labelsIcon[1],
      isShow: config.isShowProjects && projects.length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[1])}>
          <Projects projects={projects} />
        </div>
      ),
    },
  ];
  const rightSections = [
    {
      title: labels[3],
      icon: labelsIcon[3],
      isShow: intro.summary,
      component: (
        <div onClick={(e) => clickHandler(e, labels[3])}>
          <Description photo={intro.image} description={intro.summary} />
        </div>
      ),
    },
    {
      title: labels[6],
      icon: labelsIcon[6],
      isShow: [...technologies, ...libraries, ...databases].length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[6])}>
          <UnratedTabs items={[...technologies, ...libraries, ...databases]} />
        </div>
      ),
    },
    {
      title: labels[7],
      icon: labelsIcon[7],
      isShow: practices.length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[7])}>
          <UnratedTabs items={practices} />
        </div>
      ),
    },
    {
      title: labels[9],
      icon: labelsIcon[9],
      isShow: config.isShowEdu &&education.length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[9])}>
          <EduSection education={education} config={config}/>
        </div>
      ),
    },
    {
      title: labels[2],
      icon: labelsIcon[2],
      isShow: achievements,
      component: (
        <div onClick={(e) => clickHandler(e, labels[2])}>
          <Description description={achievements} />
        </div>
      ),
    },
    {
      title: labels[12],
      icon: labelsIcon[12],
      isShow: involvements,
      component: (
        <div onClick={(e) => clickHandler(e, labels[2])}>
          <Description description={involvements} />
        </div>
      ),
    },
    {
      title: labels[13],
      icon: labelsIcon[13],
      isShow: intro.referral,
      component: (
        <div onClick={(e) => clickHandler(e, 'Intro')}>
          <Description description={intro.referral}/>
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
          .filter(({ title, isShow }) => !!title && isShow)
          .map(({ title, icon, component, styles }) => (
            <ModernHeader icon={getIcon(icon)} title={title} styles={styles} key={title}>
              {component}
            </ModernHeader>
          ))}
      </LeftSection>

      <RightSection>
        {rightSections
          .filter(({ title, isShow }) => !!title && isShow)
          .map(({ title, icon, component }) => (
            <ModernHeader icon={getIcon(icon)} title={title} key={title}>
              {component}
            </ModernHeader>
          ))}
      </RightSection>
    </ResumeContainer>
  );
}
