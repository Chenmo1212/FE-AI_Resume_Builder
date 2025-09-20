import React from 'react';
import shallow from 'zustand/shallow';
import styled from 'styled-components';
import {Flex, FlexCol} from '../../styles/styles';
import {getIcon} from '../../styles/icons';
import {
  ModernHeader,
  ModernHeaderIntro,
} from '../components/section-layout/ModernHeader';
import {Intro} from '../components/intro/Intro';
import {Description} from '../components/description/Description';
import {Projects} from '../components/projects/Projects';
import {UnratedTabs} from '../components/skills/UnratedTabs';
import {Exp} from '../components/exp/Exp';
import {EduSection} from '../components/education/EduSection';
import {
  useIntro,
  useWork,
  useSkills,
  useActivities,
  useEducation,
  useLabels,
  useProjects,
} from '../../stores/data.store';
import {useLeftDrawer} from '../../stores/settings.store';
import {useTemplates} from '../../stores/templates.store';
import {leftNavList} from '../../core/containers/LeftNav';
import { LegacyHeader } from '../components/section-layout/LegacyHeader';

const ResumeContainer = styled(Flex)`
  height: 100%;
  padding: 40px 25px;
  //column-gap: 10px;
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

const LeftSection = styled(FlexCol)`
  flex-basis: 34%;
  row-gap: 20px;
  height: 100%;
  justify-content: space-between;
`;

const RightSection = styled(FlexCol)`
  flex-basis: 66%;
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
  '',
  '',
  'edit',
  'referral',
];

export default function ProfessionalTemplate() {
  const intro = useIntro((state) => state.intro);
  const [education] = useEducation((state) => [state.education], shallow);
  const [companies] = useWork((state) => [state.companies], shallow);
  const projects = useProjects((state) => state);
  const config = useTemplates((state) => state.currConfig());
  const [achievements, involvements] = useActivities((state) => [state.achievements, state.involvements], shallow);
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

  const sections = [
    {
      title: labels[3],
      icon: labelsIcon[3],
      isShow: config.isShowSummary && intro.summary,
      component: (
        <div onClick={(e) => clickHandler(e, labels[3])}>
          <Description photo={intro.image} description={intro.summary}/>
        </div>
      ),
    },
    {
      title: labels[9],
      icon: labelsIcon[9],
      isShow: config.isShowEdu && education.length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[9])}>
          <EduSection education={education} config={config}/>
        </div>
      ),
    },
    {
      title: labels[0],
      icon: labelsIcon[0],
      isShow: config.isShowExp && companies.length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[0])}>
          <Exp companies={companies} config={config}/>
        </div>
      ),
    },
    {
      title: labels[1],
      icon: labelsIcon[1],
      isShow: config.isShowProjects && projects.projects.length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[1])}>
          <Projects projects={projects.projects}/>
        </div>
      ),
    },
    {
      title: labels[6],
      icon: labelsIcon[6],
      isShow: config.isShowSkills && [...technologies, ...libraries, ...databases].length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[6])}>
          <UnratedTabs items={[...technologies, ...libraries, ...databases]}/>
        </div>
      ),
    },
    {
      title: labels[7],
      icon: labelsIcon[7],
      isShow: config.isShowPractices && practices.length,
      component: (
        <div onClick={(e) => clickHandler(e, labels[7])}>
          <UnratedTabs items={practices} />
        </div>
      ),
    },
    {
      title: labels[2],
      icon: labelsIcon[2],
      isShow: config.isShowAchievements && achievements,
      component: (
        <div onClick={(e) => clickHandler(e, labels[2])}>
          <Description description={achievements} />
        </div>
      ),
    },
    {
      title: labels[12],
      icon: labelsIcon[12],
      isShow: config.isShowInvolvements && involvements,
      component: (
        <div onClick={(e) => clickHandler(e, labels[2])}>
          <Description description={involvements} />
        </div>
      ),
    },
    {
      title: labels[13],
      icon: labelsIcon[13],
      isShow: config.isShowReferral,
      component: (
        <div onClick={(e) => clickHandler(e, 'Intro')}>
          <Description description={intro.referral}/>
        </div>
      ),
    },
  ];

  return (
    <ResumeContainer>
      <Section>
        <ModernHeaderIntro title={intro.name} profiles={intro.profiles}>
          <div onClick={(e) => clickHandler(e, 'Intro')}>
            <Intro intro={intro} labels={labels}/>
          </div>
        </ModernHeaderIntro>

        {sections
          .filter(({title, isShow}) => !!title && isShow)
          .map(({title, icon, component}) => (
            <ModernHeader icon={getIcon(icon)} title={title} key={title}>
              {component}
            </ModernHeader>
          ))}
      </Section>
    </ResumeContainer>
  );
}
