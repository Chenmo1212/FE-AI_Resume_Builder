import React from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import { templates, useTemplates } from '../../stores/templates.store';
import { useZoom, useFontSize } from '../../stores/settings.store';
import { useThemes } from '../../stores/theme.store';
import shallow from 'zustand/shallow';

const ResumeContainer = styled.div`
    width: 210mm;
    height: 296mm;
    background-color: white;
    border: 1px solid ${(props) => props.theme.fontColor};
    transform-origin: top;
    transform: ${({ $zoom }) => `scale(${1 + $zoom})`};
    margin: 6mm 6mm ${({ $zoom }) => {
        if ($zoom < 0) return 260 * $zoom;
        if ($zoom > 0) return 320 * $zoom;
        return 6;
    }}mm;

    /* Font size tokens — all template components reference these directly */
    --fs-base:   ${({ $fontScale }) => $fontScale * 10.4}px;  /* 0.65rem equivalent */
    --fs-sm:     ${({ $fontScale }) => $fontScale * 11.2}px;  /* 0.7rem  */
    --fs-md:     ${({ $fontScale }) => $fontScale * 12.8}px;  /* 0.8rem  */
    --fs-lg:     ${({ $fontScale }) => $fontScale * 16}px;    /* 1rem    */
    --fs-xl:     ${({ $fontScale }) => $fontScale * 24}px;    /* 1.5rem  */
    --fs-2xl:    ${({ $fontScale }) => $fontScale * 28.8}px;  /* 1.8rem  */

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
  const fontScale = useFontSize((state) => state.scale);
  const theme = useThemes((state) => state.theme);
  const Template = templates[index];

  return (
    <ThemeProvider theme={theme}>
      <ResumeContainer className="resume" $zoom={zoom} $fontScale={fontScale}>
        <Template />
      </ResumeContainer>
    </ThemeProvider>
  );
}
