import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import styled from 'styled-components';

const { TextArea } = Input;

const StyledModal = styled(Modal)`
  .ant-modal-content,
  .ant-modal-header,
  .ant-modal-body,
  .ant-modal-footer {
    background: #2a2a2a;
  }

  .ant-modal-header {
    border-bottom: 1px solid #3a3a3a;
  }

  .ant-modal-title,
  .ant-modal-close {
    color: #fff;
  }

  .ant-modal-close:hover {
    color: #ccc;
  }

  .ant-modal-footer {
    border-top: 1px solid #3a3a3a;
  }

  .ant-form-item-label > label {
    color: #999;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .ant-input,
  .ant-input-affix-wrapper,
  .ant-input:hover,
  .ant-input:focus,
  .ant-input-affix-wrapper:hover,
  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper-focused {
    color: #fff;
    background: #424242;
    border-color: #555;
  }

  .ant-input:hover,
  .ant-input:focus {
    border-color: #1890ff;
  }

  .ant-input::placeholder {
    color: #777;
  }

  .ant-form-item-explain-error {
    color: #ff7875;
  }
`;

export const JobModal = ({ open, mode, initialValues, onSave, onCancel }) => {
  const [form] = Form.useForm();

  // Populate form when editing, reset when adding
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, initialValues]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(values);
      form.resetFields();
    });
  };

  return (
    <StyledModal
      visible={open}
      title={mode === 'add' ? 'Add Job' : 'Edit Job'}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleOk}>
          {mode === 'add' ? 'Save Job' : 'Update Job'}
        </Button>,
      ]}
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ title: '', company: '', link: '', description: '' }}
      >
        <Form.Item
          name="title"
          label="Job Title"
          rules={[{ required: true, message: 'Job title is required' }]}
        >
          <Input placeholder="e.g. Frontend Engineer" />
        </Form.Item>
        <Form.Item name="company" label="Company">
          <Input placeholder="e.g. Stripe" />
        </Form.Item>
        <Form.Item name="link" label="Job Posting URL">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="description" label="Job Description">
          <TextArea rows={4} placeholder="Paste the job description here..." />
        </Form.Item>
      </Form>
    </StyledModal>
  );
};
