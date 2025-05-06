import { useState, useCallback, useRef } from 'react';
import type { FileNode } from '../types';
import { toggleNodeSelection, getAllSelectedFiles } from '../utils/fileUtils';

export const useFileSystem = () => {
  const [rootDirectory, setRootDirectory] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectRootDirectory = useCallback(() => {
    // Create a file input element if it doesn't exist
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFilesSelected = useCallback(async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const files = Array.from(target.files);
      setRootDirectory('Selected Files');
      
      // Process files to create a virtual directory structure
      const tree: FileNode[] = buildFileTree(files);
      setFileTree(tree);
    } catch (error) {
      console.error('Error processing files:', error);
      setError('Failed to process selected files. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Build a virtual file tree from a flat list of files
  const buildFileTree = (files: File[]): FileNode[] => {
    const tree: Record<string, FileNode> = {};
    const rootNodes: FileNode[] = [];
    
    // First pass: create all directory nodes
    files.forEach(file => {
      const path = file.webkitRelativePath || file.name;
      const pathParts = path.split('/');
      
      let currentPath = '';
      let parentPath = '';
      
      // Create directory nodes for each level
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!tree[currentPath]) {
          tree[currentPath] = {
            name: part,
            path: currentPath,
            type: 'directory',
            selected: false,
            children: [],
          };
          
          // Add to parent's children if not root
          if (parentPath && tree[parentPath]) {
            const parentNode = tree[parentPath];
            parentNode.children = parentNode.children || [];
            parentNode.children.push(tree[currentPath]);
          } else if (i === 0) {
            // This is a root node
            rootNodes.push(tree[currentPath]);
          }
        }
      }
    });
    
    // Second pass: add file nodes
    files.forEach(file => {
      const path = file.webkitRelativePath || file.name;
      const pathParts = path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Find parent directory path
      const parentPath = pathParts.slice(0, -1).join('/');
      
      const fileNode: FileNode = {
        name: fileName,
        path: path,
        type: 'file',
        selected: false,
        file: file, // Store the actual File object for later reading
      };
      
      if (parentPath && tree[parentPath]) {
        // Add to parent directory
        tree[parentPath].children = tree[parentPath].children || [];
        tree[parentPath].children.push(fileNode);
      } else {
        // This is a root level file
        rootNodes.push(fileNode);
      }
    });
    
    // If there's only one root directory and it matches the input directory name,
    // return its children to avoid an extra nesting level
    if (rootNodes.length === 1 && rootNodes[0].type === 'directory') {
      return rootNodes[0].children || [];
    }
    
    return rootNodes;
  };
  
  const toggleSelection = useCallback((path: string, selected?: boolean) => {
    setFileTree(prevTree => toggleNodeSelection(prevTree, path, selected));
  }, []);
  
  const loadFileContent = useCallback(async (node: FileNode) => {
    if (node.type !== 'file' || node.content || !node.file) return;
    
    try {
      const file = node.file;
      const content = await readFileAsText(file);
      
      setFileTree(prevTree => {
        return updateNodeWithContent(prevTree, node.path, content);
      });
    } catch (error) {
      console.error('Error loading file content:', error);
      setError(`Failed to load content for ${node.path}. Please try again.`);
    }
  }, []);
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  const updateNodeWithContent = (
    nodes: FileNode[],
    path: string,
    content: string
  ): FileNode[] => {
    return nodes.map(node => {
      if (node.path === path) {
        return { ...node, content };
      } else if (node.children) {
        return {
          ...node,
          children: updateNodeWithContent(node.children, path, content),
        };
      }
      return node;
    });
  };
  
  const getSelectedFiles = useCallback(() => {
    return getAllSelectedFiles(fileTree);
  }, [fileTree]);
  
  return {
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
  };
};