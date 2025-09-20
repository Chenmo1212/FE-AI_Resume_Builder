import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { TEMPLATE_CONFIGS, useTemplates } from '../../../stores/templates.store';
import { getIcon } from '../../../styles/icons';
import { Flex } from '../../../styles/styles';

const Container = styled.div`
  margin: 8px 0;
`;

const Heading = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  line-height: 2.5rem;
  margin-bottom: 0;
`;

const Description = styled.p`
  color: #fff;
  margin-bottom: 15px;
    font-size: 0.8rem;
`;


const Wrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
  flex-direction: column;
`;

const Handle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  font-size: 1.5rem;
  background-color: white;
`;

const SectionItem = styled.div`
  border: 1px solid #222;
  height: 2.625rem;
  padding: 0.625rem;
  max-width: 100%;
  background: #424242;
  color: #fff;
  border-radius: 2px;
  font-size: 0.8rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  text-transform: capitalize;
`;

const ResetButton = styled.span`
    color: #fff;
    background-color: #1677ff;
    font-size: 14px;
    height: 32px;
    padding: 4px 15px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
`;

// Map section IDs to display names
const sectionDisplayNames = {
  intro: 'Introduction',
  summary: 'Summary',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  achievements: 'Achievements',
  involvements: 'Involvements',
  skills: 'Skills',
  referral: 'References'
};

const DragHandle = SortableHandle(() => <Handle>{getIcon('drag')}</Handle>);

const SortableItem = SortableElement(({ sectionId }) => (
  <Wrapper>
    <Flex>
      <DragHandle />
      <SectionItem>
        {sectionDisplayNames[sectionId] || sectionId}
      </SectionItem>
    </Flex>
  </Wrapper>
));

const SortableList = SortableContainer(({ sections }) => (
  <div>
    {sections.map((sectionId, index) => (
      <SortableItem
        key={`item-${sectionId}`}
        index={index}
        sectionId={sectionId}
      />
    ))}
  </div>
));

export function OrderEdit() {
  const [index] = useTemplates((state) => [state.index]);
  const getSectionOrder = useTemplates(state => state.getSectionOrder);
  const updateSectionOrder = useTemplates(state => state.updateSectionOrder);
  
  const [sections, setSections] = useState([]);
  
  // Initialize sections from store
  useEffect(() => {
    setSections(getSectionOrder());
  }, [getSectionOrder]);
  
  // Handle sort end event
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, reorderedItem);
    
    setSections(items);
    updateSectionOrder(items);
  };
  
  // Reset to default order
  const handleReset = () => {
    setSections([...TEMPLATE_CONFIGS[index].sectionOrder]);
    updateSectionOrder([...TEMPLATE_CONFIGS[index].sectionOrder]);
  };

  return (
    <Container>
      <Heading>Section Order</Heading>
      <Description>Drag and drop sections to reorder them</Description>
      
      <SortableList
        sections={sections}
        onSortEnd={onSortEnd}
        useDragHandle
      />
      
      <ResetButton type="button" onClick={handleReset}>
        {getIcon('reset')} Reset
      </ResetButton>
    </Container>
  );
}