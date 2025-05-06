import React, { useState } from 'react';
import type { FileNode } from '../types';

interface DirectoryTreeProps {
  nodes: FileNode[];
  onToggleSelect: (path: string, selected?: boolean) => void;
  onLoadContent: (node: FileNode) => void;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({
  nodes,
  onToggleSelect,
  onLoadContent,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  
  const toggleExpand = (path: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path],
    }));
  };
  
  const renderNode = (node: FileNode, level = 0) => {
    const isExpanded = expandedNodes[node.path] || false;
    
    return (
      <div key={node.path} style={{ marginLeft: `${level * 1.5}rem` }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.25rem 0',
        }}>
          {node.type === 'directory' && (
            <span
              onClick={() => toggleExpand(node.path)}
              style={{
                cursor: 'pointer',
                marginRight: '0.25rem',
                fontWeight: 'bold',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          
          <input
            type="checkbox"
            checked={node.selected}
            onChange={() => onToggleSelect(node.path)}
            style={{
              borderRadius: '0.25rem',
              borderColor: '#d1d5db',
              marginRight: '0.5rem',
            }}
            id={`checkbox-${node.path}`}
          />
          
          <span
            onClick={() => {
              if (node.type === 'directory') {
                toggleExpand(node.path);
              } else {
                onLoadContent(node);
              }
            }}
            style={{
              cursor: 'pointer',
              color: node.type === 'directory' ? '#1d4ed8' : '#1f2937',
              fontWeight: node.type === 'directory' ? 600 : 400,
            }}
          >
            {node.name}
          </span>
        </div>
        
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div style={{
      borderRadius: '0.5rem',
      border: '2px solid #9ca3af',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '1rem',
      marginBottom: '1rem',
      maxHeight: '400px',
      overflowY: 'auto',
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '1rem',
      }}>
        File Explorer
      </h2>
      {nodes.length > 0 ? (
        nodes.map(node => renderNode(node))
      ) : (
        <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
          No files to display. Please select a folder first.
        </div>
      )}
    </div>
  );
};

export default DirectoryTree;