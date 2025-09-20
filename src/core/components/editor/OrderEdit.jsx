import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { TEMPLATE_CONFIGS, useTemplates, AVAILABLE_SECTIONS } from '../../../stores/templates.store';
import { getIcon } from '../../../styles/icons';
import { Flex } from '../../../styles/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import shallow from 'zustand/shallow';

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
  user-select: none; /* Prevent text selection during drag */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: grab; /* Show grab cursor */
  
  &:active {
    cursor: grabbing; /* Show grabbing cursor when active */
  }
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
  user-select: none; /* Prevent text selection during drag */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: move; /* Show move cursor */
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

const Divider = styled.div`
  height: 2px;
  background: white;
  margin: 20px 0;
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
};

// Get display name for a section
const getSectionDisplayName = (sectionId) => {
  return AVAILABLE_SECTIONS[sectionId]?.displayName || sectionId;
};

const DragHandle = SortableHandle(() => <Handle>{getIcon('drag')}</Handle>);

const SortableItem = SortableElement(({ sectionId, isDisabled }) => (
  <Wrapper>
    <Flex>
      <DragHandle />
      <SectionItem style={{
        opacity: isDisabled ? 0.5 : 1,
        background: isDisabled ? '#2a2a2a' : '#424242',
        borderStyle: isDisabled ? 'dashed' : 'solid'
      }}>
        {getSectionDisplayName(sectionId)}
        {isDisabled && ' (disabled)'}
      </SectionItem>
    </Flex>
  </Wrapper>
));

// Separate component for disabled sections (not sortable)
const DisabledSectionsList = ({ disabledSections }) => (
  <div style={{ userSelect: 'none' }}>
    {disabledSections.map((sectionId) => (
      <Wrapper key={`disabled-${sectionId}`}>
        <Flex>
          <Handle style={{ cursor: 'not-allowed', backgroundColor: '#e0e0e0' }}>{getIcon('drag')}</Handle>
          <SectionItem style={{
            opacity: 0.5,
            background: '#2a2a2a',
            borderStyle: 'dashed',
            cursor: 'default'
          }}>
            {getSectionDisplayName(sectionId)}
            {' (disabled)'}
          </SectionItem>
        </Flex>
      </Wrapper>
    ))}
  </div>
);

// Sortable list for enabled sections only
const SortableList = SortableContainer(({ sections }) => (
  <div style={{ userSelect: 'none' }}>
    {sections.map((sectionId, index) => (
      <SortableItem
        key={`item-${sectionId}`}
        index={index}
        sectionId={sectionId}
        isDisabled={false}
      />
    ))}
  </div>
));

export function OrderEdit() {
  const [index] = useTemplates((state) => [state.index]);
  const getSectionOrder = useTemplates(state => state.getSectionOrder);
  const updateSectionOrder = useTemplates(state => state.updateSectionOrder);
  const currConfig = useTemplates((state) => state.currConfig());
  const [updateConfig] = useTemplates((state) => [state.updateConfig], shallow);
  const getAvailableSections = useTemplates(state => state.getAvailableSections);
  
  const [sections, setSections] = useState([]);
  const [disabledSections, setDisabledSections] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  
  // Initialize sections from store
  useEffect(() => {
    // Get all available section IDs
    const allSectionIds = Object.keys(AVAILABLE_SECTIONS);
    
    // Get all available sections for the switches
    const allSections = getAvailableSections();
    setAvailableSections(allSections);
    
    // Determine which sections are enabled vs disabled based on config
    const enabledSectionIds = [];
    const disabledSectionIds = [];
    
    allSectionIds.forEach(id => {
      const section = AVAILABLE_SECTIONS[id];
      if (!section) return;
      
      const isVisible = currConfig[section.visibilityKey] !== false;
      if (isVisible) {
        enabledSectionIds.push(id);
      } else {
        disabledSectionIds.push(id);
      }
    });
    
    // Filter and sort enabled sections according to the stored order
    const orderedSections = getSectionOrder();
    const filteredSections = orderedSections.filter(id => enabledSectionIds.includes(id));
    
    // Set state
    setSections(filteredSections);
    setDisabledSections(disabledSectionIds);
    
  }, [getSectionOrder, getAvailableSections, currConfig]);
  
  // Handle sort end event
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, reorderedItem);
    
    setSections(items);
    updateSectionOrder(items);
  };
  
  // Reset to default order and visibility settings
  const handleReset = () => {
    // Get the default template configuration
    const defaultConfig = TEMPLATE_CONFIGS[index];
    
    // Reset all visibility settings to their default values
    Object.keys(AVAILABLE_SECTIONS).forEach(sectionId => {
      const section = AVAILABLE_SECTIONS[sectionId];
      const defaultValue = defaultConfig[section.visibilityKey];
      
      // Only update if the current value is different from the default
      if (currConfig[section.visibilityKey] !== defaultValue) {
        updateConfig(section.visibilityKey, defaultValue);
      }
    });
    
    // Get all available section IDs
    const allSectionIds = Object.keys(AVAILABLE_SECTIONS);
    
    // Determine which sections are enabled vs disabled based on default config
    const enabledSectionIds = [];
    const disabledSectionIds = [];
    
    allSectionIds.forEach(id => {
      const section = AVAILABLE_SECTIONS[id];
      if (!section) return;
      
      const isVisible = defaultConfig[section.visibilityKey] !== false;
      if (isVisible) {
        enabledSectionIds.push(id);
      } else {
        disabledSectionIds.push(id);
      }
    });
    
    // Get the default section order for the current template
    const defaultOrder = [...defaultConfig.sectionOrder];
    
    // Filter and sort enabled sections according to the default order
    const orderedSections = defaultOrder.filter(id => enabledSectionIds.includes(id));
    
    // Update the sections and store
    setSections(orderedSections);
    setDisabledSections(disabledSectionIds);
    updateSectionOrder(orderedSections);
    
    // Update available sections
    setAvailableSections(getAvailableSections());
  };
  
  // Handle section visibility toggle
  const handleVisibilityToggle = (visibilityKey, newValue) => {
    // Update the config
    updateConfig(visibilityKey, newValue);
    
    // Find the section ID for this visibility key
    const sectionId = Object.keys(AVAILABLE_SECTIONS).find(
      id => AVAILABLE_SECTIONS[id].visibilityKey === visibilityKey
    );
    
    if (!sectionId) return;
    
    // Handle the section movement between enabled and disabled lists
    if (newValue) {
      // Moving from disabled to enabled
      // 1. Add to enabled sections at the end
      const newSections = [...sections];
      if (!newSections.includes(sectionId)) {
        newSections.push(sectionId);
        setSections(newSections);
        updateSectionOrder(newSections);
      }
      
      // 2. Remove from disabled sections
      const newDisabledSections = disabledSections.filter(id => id !== sectionId);
      setDisabledSections(newDisabledSections);
    } else {
      // Moving from enabled to disabled
      // 1. Remove from enabled sections
      const newSections = sections.filter(id => id !== sectionId);
      setSections(newSections);
      updateSectionOrder(newSections);
      
      // 2. Add to disabled sections
      const newDisabledSections = [...disabledSections];
      if (!newDisabledSections.includes(sectionId)) {
        newDisabledSections.push(sectionId);
        setDisabledSections(newDisabledSections);
      }
    }
    
    // Update available sections
    setAvailableSections(getAvailableSections());
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
      
      {disabledSections.length > 0 && (
        <>
          <div style={{ marginTop: '20px', color: '#fff', fontSize: '0.8rem' }}>
            Disabled Sections:
          </div>
          <DisabledSectionsList disabledSections={disabledSections} />
        </>
      )}
      
      <ResetButton type="button" onClick={handleReset}>
        {getIcon('reset')} Reset
      </ResetButton>
      
      <Divider />
      {/* Section Visibility Controls */}
      <Wrapper style={configStyles}>
        <Topic>Section Visibility</Topic>
        {availableSections.map((section) => (
          <FormControlLabel
            key={section.id}
            control={
              <Switch
                checked={currConfig[section.visibilityKey]}
                onChange={() => handleVisibilityToggle(section.visibilityKey, !currConfig[section.visibilityKey])}
              />
            }
            label={`Display ${section.displayName}`}
          />
        ))}
      </Wrapper>
    </Container>
  );
}