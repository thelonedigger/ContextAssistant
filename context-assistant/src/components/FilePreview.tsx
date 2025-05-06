import React from 'react';
import type { FileNode } from '../types';

interface FilePreviewProps {
  selectedFiles: FileNode[];
}

const FilePreview: React.FC<FilePreviewProps> = ({ selectedFiles }) => {
  if (selectedFiles.length === 0) {
    return null;
  }
  
  return (
    <div style={{
      borderRadius: '0.5rem',
      border: '2px solid #9ca3af',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '1rem',
      marginBottom: '1rem',
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '1rem',
      }}>
        Selected Files ({selectedFiles.length})
      </h2>
      
      <div style={{
        maxHeight: '200px',
        overflowY: 'auto',
      }}>
        {selectedFiles.map(file => (
          <div
            key={file.path}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: '#f3f4f6',
              marginBottom: '0.5rem',
              fontSize: '14px',
              color: '#1f2937',
            }}
          >
            {file.path}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePreview;