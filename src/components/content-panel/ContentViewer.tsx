'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import type { ContentViewerProps } from '@/types';

/**
 * CopyButton — Renders a copy-to-clipboard button for code blocks.
 * Shows "Copied!" confirmation for 2 seconds after copying.
 */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail if clipboard API is unavailable
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
      aria-label={copied ? 'Copied' : 'Copy code to clipboard'}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/**
 * ContentViewer — Renders Markdown content with syntax highlighting,
 * copy-to-clipboard buttons on code blocks, and responsive image handling.
 */
export default function ContentViewer({ content }: ContentViewerProps) {
  if (!content || !content.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-8" data-testid="content-placeholder">
        <p>No content available for this topic.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 p-6 max-h-full" data-testid="content-viewer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-5 mb-3 text-gray-900 dark:text-gray-100">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium mt-3 mb-2 text-gray-800 dark:text-gray-200">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-medium mt-3 mb-1 text-gray-700 dark:text-gray-300">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium mt-2 mb-1 text-gray-700 dark:text-gray-300">{children}</h6>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="ml-2">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className || ''}`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            // Extract code text from children for copy button
            const codeText = extractTextFromChildren(children);
            return (
              <div className="relative group mb-4">
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono">
                  {children}
                </pre>
                <CopyButton code={codeText} />
              </div>
            );
          },
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ''}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const altSpan = document.createElement('span');
                altSpan.textContent = alt || 'Image failed to load';
                altSpan.className = 'text-gray-500 italic block my-2';
                target.parentNode?.insertBefore(altSpan, target.nextSibling);
              }}
              className="max-w-full h-auto my-4 rounded"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Extracts plain text content from React children (used for code block copy).
 */
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return extractTextFromChildren(props.children);
  }
  return '';
}
