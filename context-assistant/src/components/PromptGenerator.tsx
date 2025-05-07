import React, { useState } from 'react';
import type { FileNode, FormatOptions } from '../types';
import { generatePrompt } from '../utils/formatUtils';

interface PromptGeneratorProps {
  selectedFiles: FileNode[];
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ selectedFiles }) => {
  const [options, setOptions] = useState<FormatOptions>({
    includeFileStructure: true,
    useBacticksForCode: true,
  });
  
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerate = async () => {
    if (selectedFiles.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First, ensure all selected files have their content loaded
      const filesToProcess = [...selectedFiles];
      const loadContentPromises = filesToProcess.map(async (file) => {
        // Skip if content already loaded or not a file
        if (file.content || file.type !== 'file') return file;
        
        // Load the content if we have the file object
        if (file.file) {
          try {
            const content = await readFileAsText(file.file);
            return { ...file, content };
          } catch (err) {
            console.error(`Error loading content for ${file.path}:`, err);
            return file; // Return the file without content if failed
          }
        }
        return file;
      });
      
      // Wait for all content to be loaded
      const processedFiles = await Promise.all(loadContentPromises);
      
      // Generate the prompt with the processed files
      const prompt = generatePrompt(processedFiles, options);
      setGeneratedPrompt(prompt);
    } catch (err) {
      console.error('Error generating prompt:', err);
      setError('Failed to generate prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Helper function to read file content
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  return (
    <div style={{
      borderRadius: '0.5rem',
      border: '2px solid #9ca3af',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '1rem',
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#1f2937',
        marginBottom: '1rem',
      }}>
        Generate Prompt
      </h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={options.includeFileStructure}
              onChange={(e) => setOptions({
                ...options,
                includeFileStructure: e.target.checked,
              })}
              style={{
                borderRadius: '0.25rem',
                borderColor: '#d1d5db',
                marginRight: '0.5rem',
              }}
            />
            Include file structure overview
          </label>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={options.useBacticksForCode}
              onChange={(e) => setOptions({
                ...options,
                useBacticksForCode: e.target.checked,
              })}
              style={{
                borderRadius: '0.25rem',
                borderColor: '#d1d5db',
                marginRight: '0.5rem',
              }}
            />
            Use backticks for code blocks
          </label>
        </div>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={selectedFiles.length === 0 || loading}
        style={{
          backgroundColor: selectedFiles.length === 0 || loading ? '#9ca3af' : '#2563eb',
          color: 'white',
          fontWeight: 'bold',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontSize: '14px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          cursor: selectedFiles.length === 0 || loading ? 'not-allowed' : 'pointer',
          border: 'none',
          marginBottom: '1rem',
        }}
      >
        {loading ? 'Loading File Contents...' : 'Generate Prompt'}
      </button>
      
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: '1px solid #ef4444',
          color: '#b91c1c',
          fontSize: '14px',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}
      
      {generatedPrompt && (
        <>
          <div style={{
            position: 'relative',
            marginBottom: '1rem',
          }}>
            <textarea
              value={generatedPrompt}
              readOnly
              style={{
                width: '100%',
                height: '300px',
                padding: '0.5rem',
                border: '2px solid #9ca3af',
                borderRadius: '0.375rem',
                fontSize: '14px',
                color: '#1f2937',
                resize: 'vertical',
                fontFamily: 'monospace',
              }}
            />
            
            <button
              onClick={handleCopy}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                backgroundColor: copied ? '#15803d' : '#e5e7eb',
                color: copied ? 'white' : '#1f2937',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#f0fdf4',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid #86efac',
            color: '#15803d',
            fontSize: '14px',
          }}>
            Your prompt is ready! Copy and paste it into your AI tool of choice.
          </div>
        </>
      )}
    </div>
  );
};

export default PromptGenerator;