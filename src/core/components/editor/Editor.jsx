import React from 'react';
import styled from 'styled-components';
import shallow from 'zustand/shallow';
import {
  useEducation,
  useWork,
  useSkills,
  useLabels,
  useIntro,
  useVolunteer,
  useAwards,
  useProjects,
} from '../../../stores/data.store';
import {
  INTRO_METADATA,
  EDU_METADATA,
  EXP_METADATA,
  SOCIAL_METADATA,
  VOLUNTEERING_METADATA,
  AWARDS_METADATA,
  PROJECT_METADATA,
} from '../../meta-data/input_metadata';
import { SkillsEdit } from './SkillsEdit';
import { TimelineEdit } from './TimelineEdit';
import { ActivitiesEdit } from './ActivitiesEdit';
import { LabelsEdit } from './LabelsEdit';
import { IntroEdit } from './IntroEdit';
import { SocialEdit } from './SocialEdit';
import { PreferDataBtn } from "./PreferEdit";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const Divider = styled.div`
  height: 2px;
  background: white;
  margin: 20px 0;
`;

export const Container = styled.div`
  display: grid;
  gap: 1rem;
  background: #222;
`;

export const Heading = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  line-height: 2.5rem;
  margin-bottom: 0;
`;

const Wrapper = styled.div`
  margin: 8px 0;
`;

const Topic = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 7px;
`;

const configStyles = {
  color: "#fff",
  fontSize: "0.7rem"
}


export const IntroEditor = () => {
  const introState = useIntro((state) => state.intro);
  const update = useIntro((state) => state.update);

  return (
    <Container>
      <Heading>Intro <PreferDataBtn content='basics'/></Heading>
      <IntroEdit state={introState} METADATA={INTRO_METADATA} update={update} />
      <Divider />
    </Container>
  );
};

export const SocialEditor = () => {
  const profiles = useIntro((state) => state.intro.profiles);
  const updateProfiles = useIntro((state) => state.updateProfiles);

  return (
    <Container>
      <Heading>Social</Heading>
      <SocialEdit state={profiles} METADATA={SOCIAL_METADATA} update={updateProfiles} />
    </Container>
  );
};

export const ActivitiesEditor = () => (
  <Container>
    <Heading>Activities<PreferDataBtn content='activities'/></Heading>
    <ActivitiesEdit />
  </Container>
);

export const LabelsEditor = () => {
  const labelsState = useLabels((state) => state.labels);
  const update = useLabels((state) => state.update);

  return (
    <Container>
      <Heading>Template Labels</Heading>
      <LabelsEdit state={labelsState} update={update} />
    </Container>
  );
};

export const EduEditor = () => {
  const [education, eduConfig] = useEducation(
    (state) => [state.education, state.eduConfig],
    shallow
  );
  const [add, update, purge, changeOrder, updateConfig] = useEducation(
    (state) => [state.add, state.update, state.purge, state.changeOrder, state.updateConfig],
    shallow
  );
  const CONFIGS = [{
    key: "isShowDissertation",
    label: "Display Dissertation"
  }, {
    key: "isShowCourses",
    label: "Display Courses"
  }, {
    key: "isShowHighlights",
    label: "Display Highlights"
  }]

  return (
    <Container>
      <Heading>
        Education
        <PreferDataBtn content="education" />
      </Heading>
      <TimelineEdit
        METADATA={EDU_METADATA}
        itemList={education}
        identifier="studyType"
        operations={{ update, add, purge, changeOrder }}
      />

      {/* Configure */}
      <Wrapper style={configStyles}>
        <Topic>Configure</Topic>
        {CONFIGS.map(({key, label}) => (
          <FormControlLabel
            control={<Switch checked={eduConfig[key]} onChange={() => updateConfig(key, !eduConfig[key])} />}
            label={label}
            key={key}
          />
        ))}
      </Wrapper>
    </Container>
  );
};

export const ExperienceEditor = () => {
  const companies = useWork((state) => state.companies);
  const workConfig = useWork((state) => state.workConfig);
  const [add, update, purge, changeOrder, updateConfig] = useWork(
    (state) => [state.add, state.update, state.purge, state.changeOrder, state.updateConfig],
    shallow
  );
  const WORK_CONFIGS = [{
    key: "isShowLocation",
    label: "Display Location (instead of Years)"
  }];

  return (
    <Container>
      <Heading>Experience<PreferDataBtn content='work'/></Heading>
      <TimelineEdit
        METADATA={EXP_METADATA}
        itemList={companies}
        identifier="name"
        operations={{ update, add, purge, changeOrder }}
      />

      {/* Configure */}
      <Wrapper style={configStyles}>
        <Topic>Configure</Topic>
        {WORK_CONFIGS.map(({key, label}) => (
          <FormControlLabel
            control={<Switch checked={workConfig[key]} onChange={() => updateConfig(key, !workConfig[key])} />}
            label={label}
            key={key}
          />
        ))}
      </Wrapper>
    </Container>
  );
};

export const ProjectEditor = () => {
  const projects = useProjects((state) => state.projects);
  const [add, update, purge, changeOrder] = useProjects(
    (state) => [state.add, state.update, state.purge, state.changeOrder],
    shallow
  );

  return (
    <Container>
      <Heading>Project<PreferDataBtn content='projects'/></Heading>
      <TimelineEdit
        METADATA={PROJECT_METADATA}
        itemList={projects}
        identifier="title"
        operations={{ update, add, purge, changeOrder }}
      />
    </Container>
  );
};

const VolunteerEditor = () => {
  const volunteer = useVolunteer((state) => state.volunteer);
  const [add, update, purge, changeOrder] = useVolunteer(
    (state) => [state.add, state.update, state.purge, state.changeOrder],
    shallow
  );

  return (
    <Container>
      <Heading>Volunteering<PreferDataBtn content='volunteer'/></Heading>
      <TimelineEdit
        METADATA={VOLUNTEERING_METADATA}
        itemList={volunteer}
        identifier="organization"
        operations={{ update, add, purge, changeOrder }}
      />
    </Container>
  );
};

const AwardsEditor = () => {
  const awards = useAwards((state) => state.awards);
  const [add, update, purge, changeOrder] = useAwards(
    (state) => [state.add, state.update, state.purge, state.changeOrder],
    shallow
  );

  return (
    <Container>
      <Heading>Awards<PreferDataBtn content='awards'/></Heading>
      <TimelineEdit
        METADATA={AWARDS_METADATA}
        itemList={awards}
        identifier="title"
        operations={{ update, add, purge, changeOrder }}
      />
    </Container>
  );
};

export const ForteEditor = () => (
  <>
    <AwardsEditor />
    <VolunteerEditor />
  </>
);

export const SkillEditor = ({ type, hasRating = false }) => {
  const [skillList, add, update, purge, changeOrder] = useSkills(
    (state) => [state[type], state.add, state.update, state.purge, state.changeOrder],
    shallow
  );

  return (
    <Container>
      <Heading>{type.toUpperCase()} {type === "languages" ? <PreferDataBtn content='skills'/> : ""}</Heading>
      <SkillsEdit
        type={type}
        hasRating={hasRating}
        skills={skillList}
        addSkill={add}
        updateSkill={update}
        deleteSkill={purge}
        changeOrder={changeOrder}
      />
      <Divider />
    </Container>
  );
};

export const SkillsEditor = () => (
  <>
    <SkillEditor type="languages" hasRating />
    <SkillEditor type="frameworks" hasRating />
    <SkillEditor type="technologies" hasRating={false} />
    <SkillEditor type="libraries" hasRating={false} />
    <SkillEditor type="databases" hasRating={false} />
    <SkillEditor type="practices" hasRating={false} />
    <SkillEditor type="tools" hasRating={false} />
  </>
);
