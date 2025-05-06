import type { FileNode } from '../types';

export const readDirectory = async (dirHandle: FileSystemDirectoryHandle, basePath: string = ''): Promise<FileNode[]> => {
  const nodes: FileNode[] = [];
  
  for await (const [name, handle] of dirHandle.entries()) {
    const path = basePath ? `${basePath}/${name}` : name;
    
    if (handle.kind === 'file') {
      nodes.push({
        name,
        path,
        type: 'file',
        selected: false,
      });
    } else if (handle.kind === 'directory') {
      const children = await readDirectory(handle, path);
      nodes.push({
        name,
        path,
        type: 'directory',
        selected: false,
        children,
      });
    }
  }
  
  // Sort directories first, then files alphabetically
  return nodes.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'directory' ? -1 : 1;
  });
};

export const readFileContent = async (fileHandle: FileSystemFileHandle): Promise<string> => {
  const file = await fileHandle.getFile();
  return await file.text();
};

export const toggleNodeSelection = (
  nodes: FileNode[],
  path: string,
  selected?: boolean
): FileNode[] => {
  return nodes.map(node => {
    if (node.path === path) {
      return {
        ...node,
        selected: selected !== undefined ? selected : !node.selected,
      };
    } else if (node.children) {
      return {
        ...node,
        children: toggleNodeSelection(node.children, path, selected),
      };
    }
    return node;
  });
};

export const getAllSelectedFiles = (nodes: FileNode[]): FileNode[] => {
  let selectedFiles: FileNode[] = [];
  
  const traverse = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (node.selected && node.type === 'file') {
        selectedFiles.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  };
  
  traverse(nodes);
  return selectedFiles;
};