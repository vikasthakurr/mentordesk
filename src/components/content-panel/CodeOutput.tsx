'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { SupportedLanguage } from '@/types';

interface CodeOutputProps {
  code: string;
  language: SupportedLanguage;
}

/**
 * CodeOutput — Runs user code and displays output.
 * 
 * - HTML: live preview in iframe (updates as you type)
 * - CSS: live preview with demo HTML structure (updates as you type)
 * - JavaScript/TypeScript: captures console.log output on "Run" click
 * - JSON: validates and pretty-prints on "Run" click
 */
export default function CodeOutput({ code, language }: CodeOutputProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isVisualOutput = language === 'html' || language === 'css';

  // Live preview for HTML/CSS — updates automatically as code changes
  useEffect(() => {
    if (!isVisualOutput || !iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    if (language === 'html') {
      doc.open();
      doc.write(code);
      doc.close();
    } else if (language === 'css') {
      const htmlWithCss = `<!DOCTYPE html>
<html><head><style>${code}</style></head>
<body>
  <div class="container">
    <h1>CSS Preview</h1>
    <p>This is a paragraph with your styles applied.</p>
    <div class="box">Box Element</div>
    <ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>
    <button>Button</button>
    <a href="#">Link</a>
    <input type="text" placeholder="Input field" />
  </div>
</body></html>`;
      doc.open();
      doc.write(htmlWithCss);
      doc.close();
    }
  }, [code, language, isVisualOutput]);

  // Run code for JS/TS/JSON
  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);
    setError(null);

    if (language === 'json') {
      try {
        const parsed = JSON.parse(code);
        setOutput([JSON.stringify(parsed, null, 2)]);
      } catch (e: any) {
        setError(`JSON Error: ${e.message}`);
      }
      setIsRunning(false);
    } else {
      // JavaScript/TypeScript: execute and capture console output
      try {
        const wrappedCode = `
          (function() {
            const __logs = [];
            const __originalConsole = { log: console.log, error: console.error, warn: console.warn, info: console.info };
            console.log = (...args) => __logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            console.error = (...args) => __logs.push('❌ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            console.warn = (...args) => __logs.push('⚠️ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            console.info = (...args) => __logs.push('ℹ️ ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            try {
              ${code}
            } catch(e) {
              __logs.push('❌ ' + e.name + ': ' + e.message);
            }
            console.log = __originalConsole.log;
            console.error = __originalConsole.error;
            console.warn = __originalConsole.warn;
            console.info = __originalConsole.info;
            return __logs;
          })()
        `;
        const result = eval(wrappedCode);
        if (Array.isArray(result)) {
          setOutput(result.length > 0 ? result : ['(no output)']);
        }
      } catch (e: any) {
        setError(`${e.name}: ${e.message}`);
      }
      setIsRunning(false);
    }
  }, [code, language]);

  return (
    <div className="flex flex-col border-t border-gray-700 bg-gray-900 h-full">
      {/* Output Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <span className="text-sm font-medium text-gray-300">
          {isVisualOutput ? '🖥️ Live Preview' : '📟 Console Output'}
        </span>
        {!isVisualOutput && (
          <button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            {isRunning ? 'Running...' : 'Run'}
          </button>
        )}
      </div>

      {/* Output Area */}
      <div className="flex-1 min-h-0 overflow-auto">
        {isVisualOutput ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full bg-white border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
          />
        ) : (
          <div className="p-3 font-mono text-sm text-gray-300 space-y-1">
            {output.length === 0 && !error && (
              <p className="text-gray-500 italic">Click "Run" to execute your code...</p>
            )}
            {output.map((line, i) => (
              <pre key={i} className="whitespace-pre-wrap break-words">{line}</pre>
            ))}
            {error && (
              <pre className="text-red-400 whitespace-pre-wrap break-words">{error}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
