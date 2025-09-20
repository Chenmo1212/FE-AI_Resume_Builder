import React, {Fragment} from 'react';
import styled from 'styled-components';
import {message} from 'antd';
import {
  useActivities, useAwards,
  useEducation,
  useIntro,
  usePreferData,
  useProjects,
  useSkills, useVolunteer,
  useWork
} from "../../../stores/data.store";

export const Button = styled.span`
  color: #fff;
  background-color: #1677ff;
  box-shadow: 0 2px 0 rgba(5,145,255,.1);
  font-size: 14px;
  height: 32px;
  padding: 4px 15px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 20px;
`;


export function PreferDataBtn({content}: any) {
  const resetBasics = useIntro((state: any) => state.reset);
  const resetSkills = useSkills((state: any) => state.reset);
  const resetWork = useWork((state: any) => state.reset);
  const resetEducation = useEducation((state: any) => state.reset);
  const resetActivities = useActivities((state: any) => state.reset);
  const resetProjects = useProjects((state: any) => state.reset);
  const resetVolunteer = useVolunteer((state: any) => state.reset);
  const resetAwards = useAwards((state: any) => state.reset);
  const [messageApi, contextHolder] = message.useMessage();
  const [basics, education, awards, volunteer, skills, activities, projects, work] =
    usePreferData(state => [
      state.basics,
      state.education,
      state.awards,
      state.volunteer,
      state.skills,
      state.activities,
      state.projects,
      state.work,
    ])
  const handleSubmit = () => {
    console.log(content, work)
    if (content === "basics") resetBasics(basics);
    else if (content === "skills") resetSkills(skills);
    else if (content === "work") resetWork(work);
    else if (content === "education") resetEducation(education);
    else if (content === "activities") resetActivities(activities);
    else if (content === "projects") resetProjects(projects);
    else if (content === "volunteer") resetVolunteer(volunteer);
    else if (content === "awards") resetAwards(awards);

    messageApi.open({
      type: 'success',
      content: 'Use prefer data successfully!',
    });
  };
  return (
    <>
      {contextHolder}
      <Button onClick={handleSubmit}>
        Choose Prefer Data
      </Button>
    </>
  );
}
