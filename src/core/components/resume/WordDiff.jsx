import React from 'react';
import { diffWords } from 'diff';
import { Typography } from 'antd';

const { Text } = Typography;

/**
 * Component to display word-level differences between two texts
 */
const WordDiff = ({ oldText, newText }) => {
  // Convert inputs to strings and handle null/undefined
  const oldString = typeof oldText === 'string' ? oldText : String(oldText || '');
  const newString = typeof newText === 'string' ? newText : String(newText || '');
  
  // Get word-level differences
  const differences = diffWords(oldString, newString);
  
  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
      {differences.map((part, index) => {
        // Added parts (in new text but not in old)
        if (part.added) {
          return (
            <Text key={index} style={{ backgroundColor: '#d6f8d6', padding: '0 2px' }}>
              {part.value}
            </Text>
          );
        }
        // Removed parts (in old text but not in new)
        if (part.removed) {
          return (
            <Text key={index} style={{ backgroundColor: '#f8d6d6', padding: '0 2px', textDecoration: 'line-through' }}>
              {part.value}
            </Text>
          );
        }
        // Unchanged parts
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );
};

export default WordDiff;

// Made with Bob
