import React from 'react';
import styled from 'styled-components';
import { Flex } from 'src/styles/styles';
import { getIcon } from 'src/styles/icons';
import MarkdownIt from 'markdown-it';

const ProjectName = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
`;

const ProjectLink = styled.div`
  font-style: italic;
  font-size: 0.7rem;
`;

const mdParser = new MarkdownIt(/* Markdown-it options */);

export function ProjectHeader({ project }: any) {
  return (
    <>
      <Flex jc="space-between" ai="flex-end" style={{ lineHeight: 'initial' }}>
        <ProjectName>{project.title}</ProjectName>
        <ProjectLink>
          {project.demoUrl ? (
            <a href={project.demoUrl} key={project.demoUrl}>
              {getIcon(project.demoIcon)}
            </a>
          ) : (
            ''
          )}
          &nbsp;
          {project.githubUrl ? (
            <a href={project.githubUrl} key={project.githubUrl}>
              {getIcon(project.githubIcon)}
            </a>
          ) : (
            ''
          )}
        </ProjectLink>
      </Flex>
    </>
  );
}

export function Projects({ projects }: any) {
  console.log({ projects });
  return (
    <>
      {projects?.map((project: any, index: number) => (
        <div key={`${project.title}-${index}`}>
          <ProjectHeader project={project} />
          <div dangerouslySetInnerHTML={{ __html: mdParser.render(project.summary ?? '') }} />
        </div>
      ))}
    </>
  );
}
