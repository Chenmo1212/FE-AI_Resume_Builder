import React, { useState } from 'react';
import { Modal, Select, Slider, Checkbox } from 'antd';
import styled from 'styled-components';
import { useAIStore } from '../../stores/ai.store';

// ─── Layout ──────────────────────────────────────────────────────────────────

const ModalBody = styled.div`
  display: flex;
  min-height: 300px;
`;

const CategoryList = styled.ul`
  width: 130px;
  flex-shrink: 0;
  margin: 0;
  padding: 8px 0;
  list-style: none;
  border-right: 1px solid #3a3a3a;
`;

const CategoryItem = styled.li`
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px 0 0 4px;
  font-size: 13px;
  color: ${({ active }) => (active ? '#fff' : '#aaa')};
  background: ${({ active }) => (active ? '#3a3a3a' : 'transparent')};
  transition: background 0.15s, color 0.15s;

  &:hover {
    color: #fff;
    background: #333;
  }
`;

const ContentPane = styled.div`
  flex: 1;
  padding: 8px 24px 8px 20px;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const ControlGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TempValue = styled.span`
  color: #ccc;
  font-size: 13px;
  min-width: 24px;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;

  .ant-checkbox-wrapper {
    color: #ccc;
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

const SECTION_OPTIONS = [
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'summary', label: 'Summary' },
];

const CATEGORIES = [
  { key: 'ai', label: 'AI' },
];

// ─── AI Pane ─────────────────────────────────────────────────────────────────

const AIPane = () => {
  const model = useAIStore((state) => state.model);
  const temperature = useAIStore((state) => state.temperature);
  const sections = useAIStore((state) => state.sections);
  const setModel = useAIStore((state) => state.setModel);
  const setTemperature = useAIStore((state) => state.setTemperature);
  const setSections = useAIStore((state) => state.setSections);

  const handleSectionChange = (sectionKey, checked) => {
    let next;
    if (checked) {
      next = sections.includes(sectionKey)
        ? sections
        : [...sections, sectionKey];
    } else {
      next = sections.filter((s) => s !== sectionKey);
    }
    // At least 1 section must remain checked
    if (next.length === 0) return;
    setSections(next);
  };

  return (
    <div>
      <ControlGroup>
        <SectionTitle>Model</SectionTitle>
        <Select
          size="small"
          value={model}
          onChange={setModel}
          options={AI_MODELS}
          style={{ width: 160 }}
          dropdownStyle={{ background: '#2a2a2a' }}
        />
      </ControlGroup>

      <ControlGroup>
        <SectionTitle>Generation</SectionTitle>
        <SliderRow>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={setTemperature}
            tooltip={{ formatter: null }}
            style={{ flex: 1, margin: 0 }}
          />
          <TempValue>{temperature.toFixed(1)}</TempValue>
        </SliderRow>
      </ControlGroup>

      <ControlGroup>
        <SectionTitle>Optimize Sections</SectionTitle>
        <CheckboxGrid>
          {SECTION_OPTIONS.map(({ key, label }) => (
            <Checkbox
              key={key}
              checked={sections.includes(key)}
              onChange={(e) => handleSectionChange(key, e.target.checked)}
            >
              {label}
            </Checkbox>
          ))}
        </CheckboxGrid>
      </ControlGroup>
    </div>
  );
};

const PANE_MAP = {
  ai: <AIPane />,
};

// ─── Modal ───────────────────────────────────────────────────────────────────

export const SettingsModal = ({
  open,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState('ai');

  return (
    <Modal
      visible={open}
      open={open}
      onCancel={onClose}
      footer={null}
      title="Settings"
      width={560}
      bodyStyle={{ padding: '8px 0', background: '#2a2a2a' }}
      style={{ top: 80 }}
    >
      <ModalBody>
        <CategoryList>
          {CATEGORIES.map(({ key, label }) => (
            <CategoryItem
              key={key}
              active={activeCategory === key}
              onClick={() => setActiveCategory(key)}
            >
              {label}
            </CategoryItem>
          ))}
        </CategoryList>
        <ContentPane>{PANE_MAP[activeCategory]}</ContentPane>
      </ModalBody>
    </Modal>
  );
};
