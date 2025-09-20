import React, { useState } from 'react';
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

const PlaceholderContainer = styled.div`
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 2px transparent;
  color: #666;
  font-size: 14px;
`;

const LoadingPlaceholder = styled(PlaceholderContainer)`
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
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
  const [imageLoadStatus, setImageLoadStatus] = useState({});

  // Initialize all images as 'loading' when component mounts
  React.useEffect(() => {
    const initialStatus = {};
    templates.forEach((_, ind) => {
      initialStatus[ind] = 'loading';
    });
    setImageLoadStatus(initialStatus);
  }, []);

  const handleImageError = (ind) => {
    setImageLoadStatus(prev => ({
      ...prev,
      [ind]: 'error'
    }));
  };

  const handleImageLoad = (ind) => {
    setImageLoadStatus(prev => ({
      ...prev,
      [ind]: 'loaded'
    }));
  };

  return (
    <TemplateWrapper>
      {templates.map((_, ind) => (
        <TemplateThumbnail key={templatesName[ind]}>
          {imageLoadStatus[ind] === 'error' ? (
            <PlaceholderContainer
              className={templateIndex === ind ? 'selected' : ''}
              onClick={() => setTemplate(ind)}
            >
              {templatesName[ind]} Template
            </PlaceholderContainer>
          ) : imageLoadStatus[ind] === 'loading' ? (
            <>
              <LoadingPlaceholder
                className={templateIndex === ind ? 'selected' : ''}
              >
                Loading...
              </LoadingPlaceholder>
              <TemplateThumbnailImg
                src={templatesSrc[ind]}
                alt={templatesName[ind]}
                style={{ display: 'none' }}
                onError={() => handleImageError(ind)}
                onLoad={() => handleImageLoad(ind)}
              />
            </>
          ) : (
            <TemplateThumbnailImg
              src={templatesSrc[ind]}
              alt={templatesName[ind]}
              className={templateIndex === ind ? 'selected' : ''}
              onClick={() => setTemplate(ind)}
              onError={() => handleImageError(ind)}
              onLoad={() => handleImageLoad(ind)}
            />
          )}
          <TemplateName>{templatesName[ind]}</TemplateName>
        </TemplateThumbnail>
      ))}
    </TemplateWrapper>
  );
}
