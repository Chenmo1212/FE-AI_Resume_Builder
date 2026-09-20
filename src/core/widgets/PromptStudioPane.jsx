import React from 'react';
import { Button, Select, Spin, Input, Tag } from 'antd';
import styled from 'styled-components';
import { usePromptTemplatesStore } from '../../stores/promptTemplates.store';

const { TextArea } = Input;

// ─── Layout ──────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 320px;
`;

const PromptName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

const PromptDescription = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 2px;
`;

const PromptHeader = styled.div`
  margin-bottom: 12px;
`;

const MessageCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  padding: 10px;
  background: #333;
  border-radius: 6px;

  .ant-select:not(.ant-select-disabled) .ant-select-selector {
    background: #424242;
    color: #e6e6e6;
    border-color: #555;
  }
  .ant-select-arrow {
    color: #888;
  }
`;

const MessageTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 2px 6px;
  font-size: 14px;
  line-height: 1;
  margin-left: auto;
  border-radius: 3px;
  transition: color 0.15s;

  &:hover:not(:disabled) {
    color: #ff7875;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #3a3a3a;
`;

const ROLE_OPTIONS = [
  { label: 'system', value: 'system' },
  { label: 'human', value: 'human' },
  { label: 'ai', value: 'ai' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const PromptStudioPane = ({ activeId }) => {
  const {
    templates,
    editingMessages,
    saving,
    setEditingMessages,
    saveTemplate,
    isDirty,
  } = usePromptTemplatesStore();

  const activeTemplate = templates.find((t) => t.id === activeId);
  const messages = editingMessages[activeId] || [];
  const dirty = isDirty(activeId);
  const isSaving = !!saving[activeId];

  if (!activeTemplate) {
    return (
      <Wrapper style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spin tip="Loading..." />
      </Wrapper>
    );
  }

  const handleRoleChange = (index, role) => {
    const next = messages.map((m, i) => (i === index ? { ...m, role } : m));
    setEditingMessages(activeId, next);
  };

  const handleContentChange = (index, content) => {
    const next = messages.map((m, i) => (i === index ? { ...m, content } : m));
    setEditingMessages(activeId, next);
  };

  const handleDeleteMessage = (index) => {
    if (messages.length <= 1) return;
    const next = messages.filter((_, i) => i !== index);
    setEditingMessages(activeId, next);
  };

  const handleAddMessage = () => {
    setEditingMessages(activeId, [...messages, { role: 'human', content: '' }]);
  };

  const handleSave = () => {
    saveTemplate(activeId);
  };

  return (
    <Wrapper>
      <PromptHeader>
        <PromptName>
          {activeTemplate.name.replace(/_/g, ' ')}
          <Tag color="default" style={{ marginLeft: 8, fontSize: 10 }}>
            v{activeTemplate.version}
          </Tag>
        </PromptName>
        {activeTemplate.description && (
          <PromptDescription>{activeTemplate.description}</PromptDescription>
        )}
      </PromptHeader>

      {messages.map((msg, i) => (
        <MessageCard key={i}>
          <MessageTopRow>
            <Select
              value={msg.role}
              onChange={(val) => handleRoleChange(i, val)}
              options={ROLE_OPTIONS}
              size="small"
              style={{ width: 100 }}
            />
            <DeleteBtn
              onClick={() => handleDeleteMessage(i)}
              disabled={messages.length <= 1}
              title="Remove message"
            >
              ×
            </DeleteBtn>
          </MessageTopRow>
          <TextArea
            value={msg.content}
            onChange={(e) => handleContentChange(i, e.target.value)}
            autoSize={{ minRows: 2, maxRows: 10 }}
            style={{
              background: '#424242',
              color: '#e0e0e0',
              border: '1px solid #555',
              fontSize: 12,
              fontFamily: 'monospace',
              resize: 'none',
            }}
          />
        </MessageCard>
      ))}

      <Footer>
        <Button
          type="dashed"
          size="small"
          onClick={handleAddMessage}
          style={{ color: '#aaa', borderColor: '#4a4a4a' }}
        >
          + Add Message
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleSave}
          loading={isSaving}
          disabled={!dirty}
        >
          Save
        </Button>
      </Footer>
    </Wrapper>
  );
};
