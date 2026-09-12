import React, { useEffect, useState } from 'react';
import { Modal, Select, Slider, Checkbox, Menu, Spin, Input, Button } from 'antd';
import styled from 'styled-components';
import { useAIStore } from '../../stores/ai.store';
import { usePromptTemplatesStore } from '../../stores/promptTemplates.store';
import { PromptStudioPane } from './PromptStudioPane';
import { exportAllData, importAllData } from '../../db/backup';

// ─── Layout ──────────────────────────────────────────────────────────────────

const ModalBody = styled.div`
  display: flex;
  height: 100%;
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
    { value: 'gpt-5.6',      label: 'GPT-5.6 (智能/成本平衡)' },
    { value: 'gpt-5.6-terra', label: 'GPT-5.6 Terra (性价比)' },
    { value: 'gpt-5.6-luna',  label: 'GPT-5.6 Luna (低成本)' },
    { value: 'gpt-6-astra',   label: 'GPT-6 Astra (最强)' },
  ],
  deepseek: [
    { value: 'deepseek-v4-flash', label: 'DeepSeek V4 Flash (高性价比)' },
    { value: 'deepseek-v4-pro',   label: 'DeepSeek V4 Pro (高性能)' },
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
  const setModel       = useAIStore((state) => state.setModel);
  const setTemperature = useAIStore((state) => state.setTemperature);
  const setSections    = useAIStore((state) => state.setSections);
  const setProvider    = useAIStore((state) => state.setProvider);
  const setApiKey      = useAIStore((state) => state.setApiKey);
  const clearApiKey    = useAIStore((state) => state.clearApiKey);

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
          Stored locally in your browser only — never stored in any server.
        </div>
      </ControlGroup>

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

// ─── Data Pane ────────────────────────────────────────────────────────────────

const DataPane = () => {
  const [importing, setImporting] = React.useState(false);
  const [status, setStatus] = React.useState('');

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-builder-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Backup exported successfully.');
    } catch (err) {
      setStatus('Export failed: ' + err.message);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setStatus('');
    try {
      const text = await file.text();
      await importAllData(text);
      setStatus('Backup imported successfully. Reload the page to see the restored data.');
    } catch (err) {
      setStatus('Import failed: ' + err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <ControlGroup>
        <SectionTitle>Export Backup</SectionTitle>
        <Button size="small" onClick={handleExport}>
          Export Backup (.json)
        </Button>
        <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
          Downloads all your resumes, jobs, tasks, and prompt templates as a single JSON file.
        </div>
      </ControlGroup>

      <ControlGroup>
        <SectionTitle>Import Backup</SectionTitle>
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          id="backup-file-input"
          onChange={handleImport}
          disabled={importing}
        />
        <Button
          size="small"
          loading={importing}
          onClick={() => document.getElementById('backup-file-input').click()}
        >
          {importing ? 'Importing…' : 'Import Backup (.json)'}
        </Button>
        <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
          ⚠️ This will <strong style={{ color: '#ff7875' }}>replace all current data</strong> with the backup contents.
        </div>
      </ControlGroup>

      {status && (
        <div style={{ marginTop: 12, fontSize: 12, color: status.startsWith('✗') || status.startsWith('Import failed') || status.startsWith('Export failed') ? '#ff7875' : '#95d075' }}>
          {status}
        </div>
      )}
    </div>
  );
};

// ─── Modal ───────────────────────────────────────────────────────────────────

export const SettingsModal = ({ open, onClose, defaultTab }) => {
  const [selectedKey, setSelectedKey] = useState(defaultTab ?? 'ai');

  const { templates, loading, fetchTemplates, isDirty } = usePromptTemplatesStore();

  useEffect(() => {
    if (open && templates.length === 0) {
      fetchTemplates();
    }
  }, [open]);

  useEffect(() => {
    if (open) setSelectedKey(defaultTab ?? 'ai');
  }, [open, defaultTab]);

  // Derive active prompt template id from selected key
  const activePromptId = selectedKey.startsWith('prompt:')
    ? selectedKey.slice('prompt:'.length)
    : null;

  const renderContent = () => {
    if (selectedKey === 'ai') return <AIPane />;
    if (selectedKey === 'data') return <DataPane />;
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
      bodyStyle={{ padding: '8px 0', background: '#2a2a2a', height: '80vh' }}
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
          <Menu.Item key="data">Data & Backup</Menu.Item>
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
