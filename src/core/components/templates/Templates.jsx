import React from 'react';
import styled from 'styled-components';
import { templates, useTemplates, templatesSrc, templatesName } from '../../../stores/templates.store';

const TemplateWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-gap: 1rem;
`;

const TemplateThumbnailImg = styled.img`
  max-width: 100%;
  object-fit: cover;
  height: auto;
  border: solid 2px transparent;
`;

const TemplateName = styled.span`
  color: #fff;
`;

const TemplateThumbnail = styled.label`
  width: 169px;
  height: 240px;
  object-fit: cover;
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  transition: all 0.3s;

  .selected {
    border: solid 2px #1890ff;
  }
`;

export function Templates() {
  const templateIndex = useTemplates((state) => state.index);
  const setTemplate = useTemplates((state) => state.setTemplate);

  return (
    <TemplateWrapper>
      {templates.map((_, ind) => (
        <TemplateThumbnail key={templatesName[ind]}>
          <TemplateThumbnailImg
            src={templatesSrc[ind].src}
            alt="Professional"
            className={templateIndex === ind ? 'selected' : ''}
            onClick={() => setTemplate(ind)}
          />
          <TemplateName>{templatesName[ind]}</TemplateName>
        </TemplateThumbnail>
      ))}
    </TemplateWrapper>
  );
}
