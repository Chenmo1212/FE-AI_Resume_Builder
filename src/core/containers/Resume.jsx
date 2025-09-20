import React from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import { templates, useTemplates } from '../../stores/templates.store';
import { useZoom } from '../../stores/settings.store';
import { useThemes } from '../../stores/theme.store';
import shallow from 'zustand/shallow';

const ResumeContainer = styled.div`
    width: 210mm;
    height: 296mm;
    background-color: white;
    border: 1px solid ${(props) => props.theme.fontColor};
    transform-origin: top;
    transform: ${({ zoom }) => `scale(${1 + zoom})`};
    margin: 6mm 6mm ${({ zoom }) => {
        if (zoom < 0) return 260 * zoom;
        if (zoom > 0) return 320 * zoom;
        return 6;
    }}mm;

    @media print {
        border: none;
        overflow: inherit;
        margin: 0;
        transform: none;
    }
`;

export function Resume() {
  const index = useTemplates((state) => state.index);
  const zoom = useZoom((state) => state.zoom);
  const theme = useThemes((state) => state.theme);
  const Template = templates[index];

  return (
    <ThemeProvider theme={theme}>
      <ResumeContainer className="resume" zoom={zoom}>
        <Template />
      </ResumeContainer>
    </ThemeProvider>
  );
}
