import { useIntro, useWork, useSkills, useActivities, useEducation, useLabels, useProjects } from '../../stores/data.store';
import { useLeftDrawer } from '../../stores/settings.store';
import { useTemplates } from '../../stores/templates.store';
import { leftNavList } from '../../core/containers/LeftNav';
import shallow from 'zustand/shallow';
import { getIcon } from '../../styles/icons';

export function useBaseTemplate(customSectionOrder = null) {
  // 1. Data Fetching
  const intro = useIntro((state) => state.intro);
  const [education] = useEducation((state) => [state.education], shallow);
  const [companies] = useWork((state) => [state.companies], shallow);
  const [projects] = useProjects((state) => [state.projects], shallow);
  const [achievements, involvements] = useActivities((state) => [state.achievements, state.involvements], shallow);
  const labels = useLabels((state) => state.labels);
  const [config] = useTemplates((state) => [state.currConfig()], shallow);
  const setLeftDrawer = useLeftDrawer((state) => state.update);
  const [languages, technologies, practices, tools] = useSkills(
    (state) => [
      state.languages,
      state.technologies,
      state.practices,
      state.tools,
    ],
    shallow
  );

  // 2. Click Handler Logic
  const clickHandler = (e, type) => {
    e.stopPropagation();

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
        case labels[12]:
          navIndex = leftNavList.findIndex((e) => e.title === 'Activities');
          break;
        case labels[3]:
        case labels[4]:
        case labels[13]:
          navIndex = leftNavList.findIndex((e) => e.title === 'Intro');
          break;
        case labels[11]:
          navIndex = leftNavList.findIndex((e) => e.title === 'Label');
          break;
        default:
          navIndex = leftNavList.findIndex((e) => e.title === type);
      }
      
      if (navIndex !== -1) {
        setLeftDrawer(navIndex.toString());
      }
    }
  };

  // Icons mapping
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

  // 3. Section Definition Helper
  const createSection = (id, index, isShow, component, styles = {}) => ({
    id,
    title: labels[index],
    icon: labelsIcon[index],
    isShow,
    component,
    styles,
    navKey: id === 'intro' ? 'Intro' : labels[index],
  });

  // 4. Define all possible sections
  const allSections = {
    intro: createSection(
      'intro',
      -1,
      true,
      (props) => (
        <div className="Intro" onClick={(e) => clickHandler(e, 'Intro')}>
          {props.renderIntro ? props.renderIntro(intro, labels) : null}
        </div>
      )
    ),
    summary: createSection(
      'summary',
      3,
      config.isShowSummary && intro.summary,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[3])}>
          {props.renderSummary ? props.renderSummary(intro.summary, intro.image) : null}
        </div>
      )
    ),
    education: createSection(
      'education',
      9,
      config.isShowEdu && education.length > 0,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[9])}>
          {props.renderEducation ? props.renderEducation(education, config) : null}
        </div>
      )
    ),
    experience: createSection(
      'experience',
      0,
      config.isShowExp && companies.length > 0,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[0])}>
          {props.renderExperience ? props.renderExperience(companies, config) : null}
        </div>
      )
    ),
    projects: createSection(
      'projects',
      1, // labels[1] for projects
      config.isShowProjects && projects.length > 0,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[1])}>
          {props.renderProjects ? props.renderProjects(projects) : null}
        </div>
      )
    ),
    skills: createSection(
      'skills',
      6,
      config.isShowSkills && [...technologies].length > 0,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[6])}>
          {props.renderSkills ? props.renderSkills([...technologies]) : null}
        </div>
      )
    ),
    practices: createSection(
      'practices',
      7,
      config.isShowPractices && practices.length > 0,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[7])}>
          {props.renderPractices ? props.renderPractices(practices) : null}
        </div>
      )
    ),
    achievements: createSection(
      'achievements',
      2,
      config.isShowAchievements && achievements,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[2])}>
          {props.renderAchievements ? props.renderAchievements(achievements) : null}
        </div>
      )
    ),
    involvements: createSection(
      'involvements',
      12,
      config.isShowInvolvements && involvements,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[12])}>
          {props.renderInvolvements ? props.renderInvolvements(involvements) : null}
        </div>
      )
    ),
    referral: createSection(
      'referral',
      13,
      config.isShowReferral && intro.referral,
      (props) => (
        <div onClick={(e) => clickHandler(e, labels[13])}>
          {props.renderReferral ? props.renderReferral(intro.referral) : null}
        </div>
      )
    ),
  };

  // 5. Define default section order
  const defaultSectionOrder = [
    'intro',
    'summary',
    'education',
    'experience',
    'projects',
    'skills',
    'practices',
    'achievements',
    'involvements',
    'referral'
  ];

  // 6. Use custom order if provided, otherwise use default
  const sectionOrder = customSectionOrder || defaultSectionOrder;

  // 7. Get ordered sections based on sectionOrder
  // The sectionOrder array is already filtered by visibility in the store
  const getOrderedSections = (orderArray = sectionOrder) => {
    return orderArray
      .map(sectionKey => allSections[sectionKey])
      .filter(section => section && section.isShow);
  };

  // Return all the shared data and functions
  return {
    // Data
    intro,
    education,
    companies,
    projects,
    achievements,
    involvements,
    labels,
    config,
    languages,
    technologies,
    practices,
    tools,
    
    // Functions
    clickHandler,
    createSection,
    getIcon,
    
    // Section management
    allSections,
    sectionOrder,
    getOrderedSections,
  };
}