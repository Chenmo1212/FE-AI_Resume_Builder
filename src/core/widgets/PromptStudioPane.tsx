import React, { useEffect, useState } from 'react';
import { Button, Select, Spin, Input, Tag } from 'antd';
import styled from 'styled-components';
import { usePromptTemplatesStore } from '../../stores/promptTemplates.store';
import type { PromptMessage, PromptTemplate } from '../../stores/promptTemplates.store';

const { TextArea } = Input;

// ─── Layout ──────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  min-height: 320px;
`;

const PromptList = styled.ul`
  width: 140px;
  flex-shrink: 0;
  margin: 0;
  padding: 8px 0;
  list-style: none;
  border-right: 1px solid #3a3a3a;
  overflow-y: auto;
`;

const PromptListItem = styled.li<{ active: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  color: ${({ active }) => (active ? '#fff' : '#aaa')};
  background: ${({ active }) => (active ? '#3a3a3a' : 'transparent')};
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  transition: background 0.15s, color 0.15s;

  &:hover {
    color: #fff;
    background: #333;
  }
`;

const PromptLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
`;

const EditorPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 20px;
  overflow-y: auto;
`;

const PromptHeader = styled.div`
  margin-bottom: 12px;
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

const MessageCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  padding: 10px;
  background: #333;
  border-radius: 6px;
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

// ─── Internal helpers ─────────────────────────────────────────────────────────

function toShortName(name: string): string {
  return name.replace(/_/g, ' ');
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PromptStudioPane: React.FC = () => {
  const {
    templates,
    editingMessages,
    loading,
    saving,
    fetchTemplates,
    setEditingMessages,
    saveTemplate,
    isDirty,
  } = usePromptTemplatesStore();

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (templates.length > 0 && !activeId) {
      setActiveId(templates[0].id);
    }
  }, [templates]);

  if (loading) {
    return (
      <Wrapper style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Spin tip="Loading prompts..." />
      </Wrapper>
    );
  }

  if (templates.length === 0) {
    return (
      <Wrapper style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Button type="link" onClick={fetchTemplates}>
          Failed to load templates. Retry?
        </Button>
      </Wrapper>
    );
  }

  const activeTemplate: PromptTemplate | undefined = templates.find((t) => t.id === activeId);
  const messages: PromptMessage[] = (activeId && editingMessages[activeId]) || [];
  const dirty = activeId ? isDirty(activeId) : false;
  const isSaving = activeId ? !!saving[activeId] : false;

  const handleRoleChange = (index: number, role: PromptMessage['role']) => {
    const next = messages.map((m, i) => (i === index ? { ...m, role } : m));
    setEditingMessages(activeId!, next);
  };

  const handleContentChange = (index: number, content: string) => {
    const next = messages.map((m, i) => (i === index ? { ...m, content } : m));
    setEditingMessages(activeId!, next);
  };

  const handleDeleteMessage = (index: number) => {
    if (messages.length <= 1) return;
    const next = messages.filter((_, i) => i !== index);
    setEditingMessages(activeId!, next);
  };

  const handleAddMessage = () => {
    setEditingMessages(activeId!, [...messages, { role: 'human', content: '' }]);
  };

  const handleSave = () => {
    if (activeId) saveTemplate(activeId);
  };

  return (
    <Wrapper>
      {/* Left: prompt list */}
      <PromptList>
        {templates.map((tpl) => (
          <PromptListItem
            key={tpl.id}
            active={tpl.id === activeId}
            onClick={() => setActiveId(tpl.id)}
          >
            <PromptLabel>{toShortName(tpl.name)}</PromptLabel>
            {isDirty(tpl.id) && (
              <span style={{ color: '#faad14', fontSize: 14, lineHeight: 1 }}>•</span>
            )}
          </PromptListItem>
        ))}
      </PromptList>

      {/* Right: editor */}
      <EditorPane>
        {activeTemplate && (
          <>
            <PromptHeader>
              <PromptName>
                {toShortName(activeTemplate.name)}
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
                    onChange={(val: PromptMessage['role']) => handleRoleChange(i, val)}
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
                    background: '#2a2a2a',
                    color: '#e0e0e0',
                    border: '1px solid #4a4a4a',
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
          </>
        )}
      </EditorPane>
    </Wrapper>
  );
};
