export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    selected: boolean;
    children?: FileNode[];
    content?: string;
    file?: File;
}
  
export interface FormatOptions {
    includeFileStructure: boolean;
    useBacticksForCode: boolean;
}