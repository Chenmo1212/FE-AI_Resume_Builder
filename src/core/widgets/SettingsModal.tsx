import React, { useState } from 'react';
import { Modal, Select, Slider, Checkbox } from 'antd';
import styled from 'styled-components';
import { useAIStore, AIModel, AISection } from '../../stores/ai.store';

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

const CategoryItem = styled.li<{ active: boolean }>`
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
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  margin: 18px 0 10px;

  &:first-child {
    margin-top: 4px;
  }
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const FieldLabel = styled.span`
  color: #ccc;
  font-size: 13px;
  min-width: 90px;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const TempValue = styled.span`
  color: #aaa;
  font-size: 12px;
  width: 28px;
  text-align: right;
  flex-shrink: 0;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

type CategoryKey = 'ai';

const CATEGORIES: { key: CategoryKey; label: string }[] = [{ key: 'ai', label: 'AI' }];

const AI_MODELS: { label: string; value: AIModel }[] = [
  { label: 'gpt-4o', value: 'gpt-4o' },
  { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
  { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
];

const SECTION_OPTIONS: { label: string; value: AISection }[] = [
  { label: 'Experience', value: 'experience' },
  { label: 'Projects', value: 'projects' },
  { label: 'Skills', value: 'skills' },
  { label: 'Summary', value: 'summary' },
];

// ─── AI Pane ──────────────────────────────────────────────────────────────────

const AIPane: React.FC = () => {
  const { model, temperature, sections, setModel, setTemperature, setSections } = useAIStore();

  const handleSectionChange = (value: AISection, checked: boolean) => {
    const next = checked ? [...sections, value] : sections.filter((section) => section !== value);

    if (next.length === 0) return;

    setSections(next);
  };

  return (
    <>
      <SectionTitle>Model</SectionTitle>
      <FieldRow>
        <FieldLabel>LLM Model</FieldLabel>
        <Select
          value={model}
          onChange={(value: AIModel) => setModel(value)}
          options={AI_MODELS}
          size="small"
          style={{ width: 160 }}
        />
      </FieldRow>

      <SectionTitle>Generation</SectionTitle>
      <FieldRow>
        <FieldLabel>Temperature</FieldLabel>
        <SliderRow>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(value: number) => setTemperature(value)}
            style={{ flex: 1 }}
            tooltip={{ formatter: null }}
          />
          <TempValue>{temperature.toFixed(1)}</TempValue>
        </SliderRow>
      </FieldRow>

      <SectionTitle>Optimize sections</SectionTitle>
      <CheckboxGrid>
        {SECTION_OPTIONS.map(({ label, value }) => (
          <Checkbox
            key={value}
            checked={sections.includes(value)}
            onChange={(event) => handleSectionChange(value, event.target.checked)}
            style={{ color: '#ccc', fontSize: 13 }}
          >
            {label}
          </Checkbox>
        ))}
      </CheckboxGrid>
    </>
  );
};

// ─── Pane map — add future categories here ────────────────────────────────────

const PANE_MAP: Record<CategoryKey, React.ReactNode> = {
  ai: <AIPane />,
};

// ─── Modal ────────────────────────────────────────────────────────────────────

export const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('ai');

  return (
    <Modal
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
