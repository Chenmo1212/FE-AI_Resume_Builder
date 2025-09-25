import React, { useState } from 'react';
import { Modal, Tabs, Button, Switch, Row, Col, Typography, Collapse, Space } from 'antd';
import ReactDiffViewer from 'react-diff-viewer-continued';
import WordDiff from './WordDiff';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Panel } = Collapse;

/**
 * Component for displaying a side-by-side comparison between original and optimized resume
 */
const ResumeComparisonModal = ({
  visible,
  onCancel,
  onApply,
  originalResume,
  optimizedResume,
}) => {
  console.log("ResumeComparisonModal props:", { visible, originalResume, optimizedResume });
  const [showDiff, setShowDiff] = useState(true);
  const [diffMode, setDiffMode] = useState('word'); // 'word' or 'line'
  const [selectedSections, setSelectedSections] = useState({
    basics: true,
    work: true,
    projects: true,
    skills: true,
  });

  // Helper function to format resume sections for display
  const formatSection = (section) => {
    if (!section) return '';
    
    if (Array.isArray(section)) {
      // For arrays of work experience or projects
      return section.map(item => {
        if (typeof item === 'object') {
          // Extract relevant text fields from work or project items
          const parts = [];
          
          if (item.company || item.name) {
            parts.push(item.company || item.name);
          }
          
          if (item.position) {
            parts.push(item.position);
          }
          
          if (item.description) {
            parts.push(item.description);
          }
          
          // Handle highlights array
          if (Array.isArray(item.highlights) && item.highlights.length > 0) {
            parts.push(item.highlights.map(h => `• ${h.replace(/^\*\s*/, '')}`).join('\n'));
          }
          
          return parts.join('\n');
        }
        return String(item);
      }).join('\n\n');
    } else if (typeof section === 'object') {
      // For objects like skills or basics
      if (section.summary) {
        // For summary section
        return section.summary;
      } else if (section.skills || section.keywords || section.languages || section.frameworks || section.libraries) {
        // For skills section - extract all skill keywords from different categories
        let allSkills = [];
        // Process skills array
        if (Array.isArray(section.skills)) {
          allSkills = [...allSkills, ...section.skills];
        }
        // Process keywords array
        if (Array.isArray(section.keywords)) {
          allSkills = [...allSkills, ...section.keywords];
        }
        // Process languages array
        if (Array.isArray(section.languages)) {
          allSkills = [...allSkills, ...section.languages];
        }
        // Process frameworks array
        if (Array.isArray(section.frameworks)) {
          allSkills = [...allSkills, ...section.frameworks];
        }
        // Process libraries array
        if (Array.isArray(section.libraries)) {
          allSkills = [...allSkills, ...section.libraries];
        }
        
        // Process nested categories
        Object.entries(section).forEach(([category, value]) => {
          if (Array.isArray(value)) {
            // For arrays of skills in categories
            allSkills = [...allSkills, ...value];
          } else if (typeof value === 'object' && value !== null) {
            // For nested objects with skill lists
            Object.values(value).forEach(subValue => {
              if (Array.isArray(subValue)) {
                allSkills = [...allSkills, ...subValue];
              }
            });
          }
        });
        
        // Sort skills alphabetically for better comparison
        allSkills.sort();
        
        // Format skills as a bulleted list for better readability
        return allSkills.map(skill => `• ${skill.name}`).join('\n');
      }
      
      // For other objects, extract text values
      return Object.values(section)
        .filter(value => typeof value === 'string')
        .join('\n');
    }
    
    // For text content, return as is
    return String(section);
  };

  // Helper function to check if a section has changes
  const hasChanges = (originalSection, optimizedSection) => {
    // Format both sections and normalize whitespace for more accurate comparison
    const formattedOriginal = formatSection(originalSection).replace(/\s+/g, ' ').trim();
    const formattedOptimized = formatSection(optimizedSection).replace(/\s+/g, ' ').trim();
    
    return formattedOriginal !== formattedOptimized;
  };

  // Handle section selection changes
  const handleSectionChange = (section, checked) => {
    setSelectedSections({
      ...selectedSections,
      [section]: checked,
    });
  };

  // Apply only selected sections
  const handleApply = () => {
    const selectedOptimizations = {};
    
    Object.keys(selectedSections).forEach(section => {
      if (selectedSections[section]) {
        if (section === 'basics') {
          selectedOptimizations.basics = optimizedResume.basics;
        } else {
          selectedOptimizations[section] = optimizedResume[section];
        }
      } else {
        if (section === 'basics') {
          selectedOptimizations.basics = originalResume.basics;
        } else {
          selectedOptimizations[section] = originalResume[section];
        }
      }
    });
    
    onApply(selectedOptimizations);
  };

  // Render the appropriate diff view based on the mode
  const renderDiffView = (oldValue, newValue, leftTitle, rightTitle) => {
    if (!showDiff) {
      // If diff is not shown, display original and optimized side by side
      return (
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>{leftTitle}</Title>
            <pre>{oldValue}</pre>
          </Col>
          <Col span={12}>
            <Title level={5}>{rightTitle}</Title>
            <pre>{newValue}</pre>
          </Col>
        </Row>
      );
    } else if (diffMode === 'word') {
      // If word diff is enabled, only show the optimized content with highlighted changes
      return (
        <div style={{ padding: '8px', border: '1px solid #f0f0f0', borderRadius: '4px', backgroundColor: '#fafafa' }}>
          <Title level={5}>{rightTitle} (with changes highlighted)</Title>
          <WordDiff oldText={oldValue} newText={newValue} />
        </div>
      );
    } else {
      // If line diff is enabled, show the traditional side-by-side diff view
      return (
        <ReactDiffViewer
          oldValue={oldValue}
          newValue={newValue}
          splitView={true}
          leftTitle={leftTitle}
          rightTitle={rightTitle}
          disableWordDiff={true}
        />
      );
    }
  };

  return (
    <Modal
      title="Resume Optimization Comparison"
      visible={visible && optimizedResume !== null}
      width="90%"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="apply" type="primary" onClick={handleApply}>
          Apply Selected Changes
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Switch
              checked={showDiff}
              onChange={setShowDiff}
              checkedChildren="Show Diff"
              unCheckedChildren="Hide Diff"
            />
            {showDiff && (
              <Switch
                checked={diffMode === 'word'}
                onChange={(checked) => setDiffMode(checked ? 'word' : 'line')}
                checkedChildren="Word Diff"
                unCheckedChildren="Line Diff"
              />
            )}
            <Text>
              {showDiff 
                ? (diffMode === 'word' 
                  ? "Showing optimized content with word-level changes highlighted" 
                  : "Showing side-by-side line comparison")
                : "Showing original and optimized content side by side"
              }
            </Text>
          </Space>
        </div>

        <Collapse defaultActiveKey={['basics', 'work', 'projects', 'skills']}>
          {/* Summary Section */}
          {optimizedResume?.basics && (
            <Panel
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>Summary</span>
                  <Switch
                    checked={selectedSections.basics}
                    onChange={(checked) => handleSectionChange('basics', checked)}
                  />
                </div>
              }
              key="basics"
              extra={hasChanges(originalResume?.basics?.summary, optimizedResume?.basics?.summary) ?
                <Text type="warning" style={{ margin: "0 10px" }}>Modified</Text> : <Text type="secondary">Unchanged</Text>}
            >
              {renderDiffView(
                formatSection(originalResume?.basics?.summary || ''),
                formatSection(optimizedResume?.basics?.summary || ''),
                "Original Summary",
                "Optimized Summary"
              )}
            </Panel>
          )}

          {/* Work Experience Section */}
          <Panel
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Work Experience</span>
                <Switch
                  checked={selectedSections.work}
                  onChange={(checked) => handleSectionChange('work', checked)}
                />
              </div>
            }
            key="work"
            extra={hasChanges(originalResume?.work, optimizedResume?.work) ?
              <Text type="warning" style={{ margin: "0 10px" }}>Modified</Text> : <Text type="secondary">Unchanged</Text>}
          >
            {renderDiffView(
              formatSection(originalResume?.work || []),
              formatSection(optimizedResume?.work || []),
              "Original Work Experience",
              "Optimized Work Experience"
            )}
          </Panel>

          {/* Projects Section */}
          <Panel
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Projects</span>
                <Switch
                  checked={selectedSections.projects}
                  onChange={(checked) => handleSectionChange('projects', checked)}
                />
              </div>
            }
            key="projects"
            extra={hasChanges(originalResume?.projects, optimizedResume?.projects) ?
              <Text type="warning" style={{ margin: "0 10px" }}>Modified</Text> : <Text type="secondary">Unchanged</Text>}
          >
            {renderDiffView(
              formatSection(originalResume?.projects || []),
              formatSection(optimizedResume?.projects || []),
              "Original Projects",
              "Optimized Projects"
            )}
          </Panel>

          {/* Skills Section */}
          <Panel
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Skills</span>
                <Switch
                  checked={selectedSections.skills}
                  onChange={(checked) => handleSectionChange('skills', checked)}
                />
              </div>
            }
            key="skills"
            extra={hasChanges(originalResume?.skills, optimizedResume?.skills) ?
              <Text type="warning" style={{ margin: "0 10px" }}>Modified</Text> : <Text type="secondary">Unchanged</Text>}
          >
            {renderDiffView(
              formatSection(originalResume?.skills || {}),
              formatSection(optimizedResume?.skills || {}),
              "Original Skills",
              "Optimized Skills"
            )}
          </Panel>
        </Collapse>
      </Space>
    </Modal>
  );
};

export default ResumeComparisonModal;

// Made with Bob
