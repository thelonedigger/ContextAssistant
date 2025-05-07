import type { FileNode, FormatOptions } from '../types';

// Create a proper directory tree structure from file paths
const buildDirectoryTree = (files: FileNode[]): Record<string, any> => {
  const tree: Record<string, any> = {};
  
  for (const file of files) {
    // Split the path into parts
    const parts = file.path.split(/[\/\\]/).filter(Boolean);
    if (parts.length === 0) continue;
    
    // Navigate through the tree, creating nodes as needed
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      
      if (!current[part]) {
        current[part] = isFile ? null : {};
      }
      
      if (!isFile) {
        current = current[part];
      }
    }
  }
  
  return tree;
};

// Format the directory tree as a string with tree branch characters
const formatDirectoryTree = (
  tree: Record<string, any>,
  prefix: string = '',
  name: string = '',
  isLast: boolean = true
): string => {
  let result = '';
  
  // Add current node if it has a name
  if (name) {
    const isDirectory = tree !== null;
    result += `${prefix}${isLast ? '└── ' : '├── '}${name}${isDirectory ? '/' : ''}\n`;
    
    // Return early if this is a file (null node)
    if (!isDirectory) {
      return result;
    }
  }
  
  // Get and sort entries - directories first, then files alphabetically
  const entries = Object.entries(tree || {}).sort(([nameA, valueA], [nameB, valueB]) => {
    const isADirectory = valueA !== null;
    const isBDirectory = valueB !== null;
    
    if (isADirectory && !isBDirectory) return -1;
    if (!isADirectory && isBDirectory) return 1;
    
    return nameA.localeCompare(nameB);
  });
  
  // Process children
  entries.forEach(([entryName, entryValue], index) => {
    const entryIsLast = index === entries.length - 1;
    const newPrefix = `${prefix}${isLast ? '    ' : '│   '}`;
    
    result += formatDirectoryTree(entryValue, newPrefix, entryName, entryIsLast);
  });
  
  return result;
};

export const generatePrompt = (
  selectedFiles: FileNode[],
  options: FormatOptions
): string => {
  let prompt = '';
  
  // Add file structure if requested
  if (options.includeFileStructure) {
    if (selectedFiles.length > 0) {
      // Build the directory tree
      const tree = buildDirectoryTree(selectedFiles);
      
      // Process each root directory
      const rootEntries = Object.entries(tree).sort();
      
      for (const [rootDir, rootTree] of rootEntries) {
        // Print the root directory name
        prompt += `${rootDir}/\n`;
        
        // Format children
        if (rootTree !== null) {
          const treeFormat = formatDirectoryTree(rootTree);
          prompt += treeFormat;
        }
        
        prompt += '\n';
      }
    } else {
      prompt += 'No files selected.\n\n';
    }
  }
  
  // Add file contents
  for (const file of selectedFiles) {
    prompt += `[${file.path}]\n`;
    
    if (options.useBacticksForCode && file.content) {
      prompt += '```\n';
      prompt += file.content;
      prompt += '\n```\n\n';
    } else if (file.content) {
      prompt += file.content;
      prompt += '\n\n';
    }
  }
  
  return prompt;
};