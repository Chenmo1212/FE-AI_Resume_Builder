import React, { useEffect, useState } from 'react';
import { Modal, Select, Slider, Checkbox, Menu, Spin, Input, Button } from 'antd';
import styled from 'styled-components';
import { useAIStore } from '../../stores/ai.store';
import { usePromptTemplatesStore } from '../../stores/promptTemplates.store';
import { PromptStudioPane } from './PromptStudioPane';

// ─── Layout ──────────────────────────────────────────────────────────────────

const ModalBody = styled.div`
  display: flex;
  min-height: 300px;
`;

const StyledMenu = styled(Menu)`
  width: 160px;
  flex-shrink: 0;
  background: #2a2a2a !important;
  border-right: 1px solid #3a3a3a !important;
  font-size: 13px;

  /* top-level items & submenu titles */
  .ant-menu-item,
  .ant-menu-submenu-title {
    font-size: 13px;
    height: 36px;
    line-height: 36px;
    margin: 0 !important;
    padding-left: 16px !important;
    border-radius: 4px 0 0 4px;
  }

  /* sub-items (indented) */
  .ant-menu-sub .ant-menu-item {
    padding-left: 28px !important;
    font-size: 12px;
    height: 32px;
    line-height: 32px;
  }

  /* sub-menu background */
  .ant-menu-sub.ant-menu-inline {
    background: #2a2a2a !important;
  }

  /* selected item */
  .ant-menu-item-selected,
  .ant-menu-item-selected:hover {
    background: #3a3a3a !important;
    color: #fff !important;
  }

  /* hover */
  .ant-menu-item:hover,
  .ant-menu-submenu-title:hover {
    background: #333 !important;
    color: #fff !important;
  }

  /* arrow */
  .ant-menu-submenu-arrow::before,
  .ant-menu-submenu-arrow::after {
    background: #666 !important;
  }
  .ant-menu-submenu-open > .ant-menu-submenu-title .ant-menu-submenu-arrow::before,
  .ant-menu-submenu-open > .ant-menu-submenu-title .ant-menu-submenu-arrow::after,
  .ant-menu-submenu-title:hover .ant-menu-submenu-arrow::before,
  .ant-menu-submenu-title:hover .ant-menu-submenu-arrow::after {
    background: #aaa !important;
  }
`;

const ContentPane = styled.div`
  flex: 1;
  padding: 8px 24px 8px 20px;
  overflow: auto;
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
    margin-left: 0 !important;
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const AI_MODELS_BY_PROVIDER = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  deepseek: [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  ],
};

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'DeepSeek' },
];

const SECTION_OPTIONS = [
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'summary', label: 'Summary' },
];

// ─── AI Pane ─────────────────────────────────────────────────────────────────

const AIPane = () => {
  const model       = useAIStore((state) => state.model);
  const temperature = useAIStore((state) => state.temperature);
  const sections    = useAIStore((state) => state.sections);
  const provider    = useAIStore((state) => state.provider);
  const apiKey      = useAIStore((state) => state.apiKey);
  const baseUrl     = useAIStore((state) => state.baseUrl);
  const setModel       = useAIStore((state) => state.setModel);
  const setTemperature = useAIStore((state) => state.setTemperature);
  const setSections    = useAIStore((state) => state.setSections);
  const setProvider    = useAIStore((state) => state.setProvider);
  const setApiKey      = useAIStore((state) => state.setApiKey);
  const clearApiKey    = useAIStore((state) => state.clearApiKey);
  const setBaseUrl     = useAIStore((state) => state.setBaseUrl);
  const clearBaseUrl   = useAIStore((state) => state.clearBaseUrl);

  // When provider changes, reset model to first option for that provider
  const handleProviderChange = (val) => {
    setProvider(val);
    setModel(AI_MODELS_BY_PROVIDER[val][0].value);
  };

  const handleSectionChange = (sectionKey, checked) => {
    let next;
    if (checked) {
      next = sections.includes(sectionKey) ? sections : [...sections, sectionKey];
    } else {
      next = sections.filter((s) => s !== sectionKey);
    }
    if (next.length === 0) return;
    setSections(next);
  };

  return (
    <div>
      {/* Provider */}
      <ControlGroup>
        <SectionTitle>Provider</SectionTitle>
        <Select
          size="small"
          value={provider}
          onChange={handleProviderChange}
          options={PROVIDER_OPTIONS}
          style={{ width: 160 }}
        />
      </ControlGroup>

      {/* API Key */}
      <ControlGroup>
        <SectionTitle>API Key</SectionTitle>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Input.Password
            size="small"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'DeepSeek'} API key`}
            style={{ flex: 1, background: '#1a1a1a', borderColor: '#444', color: '#ccc' }}
          />
          <Button
            size="small"
            danger
            disabled={!apiKey}
            onClick={clearApiKey}
            title="Clear API key"
          >
            Clear
          </Button>
        </div>
        <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
          Stored locally. Leave blank to use the server default key.
        </div>
      </ControlGroup>

      {/* Base URL — DeepSeek only */}
      {provider === 'deepseek' && (
        <ControlGroup>
          <SectionTitle>Base URL</SectionTitle>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              size="small"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.deepseek.com"
              style={{ flex: 1, background: '#1a1a1a', borderColor: '#444', color: '#ccc' }}
            />
            <Button
              size="small"
              danger
              disabled={!baseUrl}
              onClick={clearBaseUrl}
              title="Clear base URL"
            >
              Clear
            </Button>
          </div>
        </ControlGroup>
      )}

      {/* Model */}
      <ControlGroup>
        <SectionTitle>Model</SectionTitle>
        <Select
          size="small"
          value={model}
          onChange={setModel}
          options={AI_MODELS_BY_PROVIDER[provider] ?? AI_MODELS_BY_PROVIDER.openai}
          style={{ width: 160 }}
        />
      </ControlGroup>

      {/* Temperature */}
      <ControlGroup>
        <SectionTitle>Temperature</SectionTitle>
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

      {/* Sections */}
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

// ─── Modal ───────────────────────────────────────────────────────────────────

export const SettingsModal = ({ open, onClose }) => {
  const [selectedKey, setSelectedKey] = useState('ai');

  const { templates, loading, fetchTemplates, isDirty } = usePromptTemplatesStore();

  useEffect(() => {
    if (open && templates.length === 0) {
      fetchTemplates();
    }
  }, [open]);

  // Derive active prompt template id from selected key
  const activePromptId = selectedKey.startsWith('prompt:')
    ? selectedKey.slice('prompt:'.length)
    : null;

  const renderContent = () => {
    if (selectedKey === 'ai') return <AIPane />;
    if (activePromptId) return <PromptStudioPane activeId={activePromptId} />;
    return null;
  };

  return (
    <Modal
      visible={open}
      open={open}
      onCancel={onClose}
      footer={null}
      title="Settings"
      width={'60%'}
      bodyStyle={{ padding: '8px 0', background: '#2a2a2a', height: '1100px' }}
      style={{ top: 80 }}
    >
      <ModalBody>
        <StyledMenu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['prompt-studio']}
          onClick={({ key }) => {
            if (key !== '__loading__') setSelectedKey(key);
          }}
        >
          <Menu.Item key="ai">AI</Menu.Item>
          <Menu.SubMenu key="prompt-studio" title="Prompts">
            {loading ? (
              <Menu.Item key="__loading__" disabled>
                <Spin size="small" />
              </Menu.Item>
            ) : (
              templates.map((tpl) => (
                <Menu.Item key={`prompt:${tpl.id}`}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tpl.name.replace(/_/g, ' ')}
                    </span>
                    {isDirty(tpl.id) && (
                      <span style={{ color: '#faad14', fontSize: 14, lineHeight: 1 }}>•</span>
                    )}
                  </span>
                </Menu.Item>
              ))
            )}
          </Menu.SubMenu>
        </StyledMenu>
        <ContentPane>{renderContent()}</ContentPane>
      </ModalBody>
    </Modal>
  );
};
