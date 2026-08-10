// =============================================================================
// Download Utility Functions
// =============================================================================

import type { TopicType, SupportedLanguage } from '@/types';

/**
 * Converts a title string to kebab-case for use in filenames.
 * - Lowercases the string
 * - Replaces spaces with hyphens
 * - Removes non-alphanumeric characters (except hyphens)
 * - Collapses multiple consecutive hyphens
 * - Trims leading/trailing hyphens
 */
export function toKebabCase(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Language-to-extension mapping for code files.
 */
const languageExtensionMap: Record<SupportedLanguage, string> = {
  javascript: '.js',
  typescript: '.ts',
  html: '.html',
  css: '.css',
  json: '.json',
};

/**
 * Returns the appropriate file extension based on topic type and optional language.
 * - 'code' / 'mixed': maps language to extension, defaults to .js
 * - 'content': always .md
 * - 'diagram': always .png
 */
export function getFileExtension(type: TopicType | 'mixed', language?: SupportedLanguage): string {
  switch (type) {
    case 'code':
    case 'mixed':
      return language ? (languageExtensionMap[language] ?? '.js') : '.js';
    case 'content':
      return '.md';
    case 'diagram':
      return '.png';
    default:
      return '.js';
  }
}

/**
 * Returns the MIME type for a given language.
 */
function getMimeType(language: SupportedLanguage): string {
  switch (language) {
    case 'javascript':
      return 'text/javascript';
    case 'typescript':
      return 'text/typescript';
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'json':
      return 'application/json';
    default:
      return 'text/plain';
  }
}

/**
 * Creates a temporary anchor element, triggers a download, then cleans up.
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the current code as a file with the appropriate extension.
 */
export function downloadCodeFile(
  title: string,
  code: string,
  language: SupportedLanguage
): void {
  const mimeType = getMimeType(language);
  const blob = new Blob([code], { type: mimeType });
  const filename = toKebabCase(title) + getFileExtension('code', language);
  triggerDownload(blob, filename);
}

/**
 * Downloads Markdown content as a .md file.
 */
export function downloadMarkdownFile(title: string, markdownContent: string): void {
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const filename = toKebabCase(title) + '.md';
  triggerDownload(blob, filename);
}

/**
 * Downloads a PNG blob (from Excalidraw export) as a .png file.
 */
export function downloadDiagramPng(title: string, blob: Blob): void {
  const filename = toKebabCase(title) + '.png';
  triggerDownload(blob, filename);
}
