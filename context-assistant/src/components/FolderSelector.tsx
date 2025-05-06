// src/components/FolderSelector.tsx
import React from 'react';

interface FolderSelectorProps {
  onSelect: () => void;
  isLoading: boolean;
  selectedFolder: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>; // Keep this as is
  handleFilesSelected: (event: Event) => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  onSelect,
  isLoading,
  selectedFolder,
  fileInputRef,
  handleFilesSelected,
}) => {
  return (
    <div style={{
      marginBottom: '1rem',
      padding: '1.5rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.5rem',
      border: '2px solid #9ca3af',
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '1rem',
      }}>
        Select Files or Folders
      </h2>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <button
          onClick={onSelect}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
            color: 'white',
            fontWeight: 'bold',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '14px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            border: 'none',
          }}
        >
          {isLoading ? 'Loading...' : 'Choose Files'}
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFilesSelected(e as unknown as Event)}
          style={{ display: 'none' }}
          multiple
          // These attributes need special handling for TypeScript
          {...({webkitdirectory: "", directory: ""} as any)}
        />
        
        {selectedFolder && (
          <div style={{
            fontSize: '14px',
            color: '#4b5563',
          }}>
            {selectedFolder}
          </div>
        )}
      </div>
      
      <p style={{
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '0.5rem',
      }}>
        Note: To select folders, use Chrome or Edge browser which supports directory selection.
      </p>
    </div>
  );
};

export default FolderSelector;