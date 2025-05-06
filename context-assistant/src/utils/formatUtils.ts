import type { FileNode, FormatOptions } from '../types';

export const generatePrompt = (
  selectedFiles: FileNode[],
  options: FormatOptions
): string => {
  let prompt = '';
  
  // Add file structure if requested
  if (options.includeFileStructure) {
    prompt += 'File structure:\n';
    const paths = selectedFiles.map(file => file.path);
    paths.sort();
    for (const path of paths) {
      prompt += `- ${path}\n`;
    }
    prompt += '\n';
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