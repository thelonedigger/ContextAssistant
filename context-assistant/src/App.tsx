// src/App.tsx
import React from 'react';
import FolderSelector from './components/FolderSelector';
import DirectoryTree from './components/DirectoryTree';
import FilePreview from './components/FilePreview';
import PromptGenerator from './components/PromptGenerator';
import { useFileSystem } from './hooks/useFileSystem';
import './App.css'; // We'll create this file

const App: React.FC = () => {
  const {
    rootDirectory,
    fileTree,
    loading,
    error,
    selectRootDirectory,
    toggleSelection,
    loadFileContent,
    getSelectedFiles,
    fileInputRef,
    handleFilesSelected,
  } = useFileSystem();
  
  const selectedFiles = getSelectedFiles();
  
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'sans-serif',
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        Code Prompt Generator
      </h1>
      
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          border: '1px solid #ef4444',
          borderRadius: '0.375rem',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}
      
      <FolderSelector
        onSelect={selectRootDirectory}
        isLoading={loading}
        selectedFolder={rootDirectory}
        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
        handleFilesSelected={handleFilesSelected}
      />
      
      <div className="two-column-grid">
        <div>
          <DirectoryTree
            nodes={fileTree}
            onToggleSelect={toggleSelection}
            onLoadContent={loadFileContent}
          />
        </div>
        
        <div>
          <FilePreview selectedFiles={selectedFiles} />
          <PromptGenerator selectedFiles={selectedFiles} />
        </div>
      </div>
    </div>
  );
};

export default App;