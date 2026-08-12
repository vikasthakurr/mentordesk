'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { configureMonaco } from '@/lib/monaco-config';
import { buildStorageKey, saveCode, loadCode, clearEntry } from '@/lib/session-storage';
import { syncSavedCode } from '@/lib/api-client';
import { getCurrentBatch } from '@/lib/batch';

import ResizeHandle from '@/components/ui/ResizeHandle';

configureMonaco();

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
        <svg className="animate-spin h-5 w-5 mr-2 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    ),
  }
);

type FileTab = 'html' | 'css' | 'js' | 'ts';

interface MultiFileEditorProps {
  topicSlug: string;
  partSlug: string;
  moduleSlug: string;
  defaultHtml?: string;
  defaultCss?: string;
  defaultJs?: string;
  defaultTs?: string;
  onCodeChange?: (code: string, language: string) => void;
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>Start coding here...</p>
</body>
</html>`;

const DEFAULT_CSS = `body {
  font-family: sans-serif;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
}`;

const DEFAULT_JS = `// JavaScript code here
console.log("Hello from JavaScript!");
`;

const DEFAULT_TS = `// TypeScript code here
const greeting: string = "Hello from TypeScript!";
console.log(greeting);
`;

export default function MultiFileEditor({
  topicSlug,
  partSlug,
  moduleSlug,
  defaultHtml,
  defaultCss,
  defaultJs,
  defaultTs,
  onCodeChange: onCodeChangeCallback,
}: MultiFileEditorProps) {
  const [activeFile, setActiveFile] = useState<FileTab>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [tsCode, setTsCode] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(13);
  const [previewWidth, setPreviewWidth] = useState(50); // percentage
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dbSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const htmlKey = buildStorageKey(partSlug, moduleSlug, topicSlug, 'code') + ':html';
  const cssKey = buildStorageKey(partSlug, moduleSlug, topicSlug, 'code') + ':css';
  const jsKey = buildStorageKey(partSlug, moduleSlug, topicSlug, 'code') + ':js';
  const tsKey = buildStorageKey(partSlug, moduleSlug, topicSlug, 'code') + ':ts';

  // Load saved code or defaults on mount
  useEffect(() => {
    const loadedHtml = loadCode(htmlKey) ?? defaultHtml ?? DEFAULT_HTML;
    const loadedCss = loadCode(cssKey) ?? defaultCss ?? DEFAULT_CSS;
    const loadedJs = loadCode(jsKey) ?? defaultJs ?? DEFAULT_JS;
    const loadedTs = loadCode(tsKey) ?? defaultTs ?? DEFAULT_TS;
    setHtmlCode(loadedHtml);
    setCssCode(loadedCss);
    setJsCode(loadedJs);
    setTsCode(loadedTs);
    // Notify parent of initial JS code so download works without edits
    onCodeChangeCallback?.(loadedJs, 'javascript');
  }, [topicSlug]);

  // Save code with debounce
  const debouncedSave = useCallback((key: string, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveCode(key, value);
    }, 1000);
  }, []);

  // Listen for console messages from the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'console') {
        setConsoleLogs(prev => [...prev.slice(-50), `[${e.data.level}] ${e.data.message}`]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') { e.preventDefault(); setActiveFile('html'); }
        if (e.key === '2') { e.preventDefault(); setActiveFile('css'); }
        if (e.key === '3') { e.preventDefault(); setActiveFile('js'); }
        if (e.key === '4') { e.preventDefault(); setActiveFile('ts'); }
        if (e.key === 's') { e.preventDefault(); saveCode(htmlKey, htmlCode); saveCode(cssKey, cssCode); saveCode(jsKey, jsCode); saveCode(tsKey, tsCode); }
        if (e.key === 'p' && e.shiftKey) { e.preventDefault(); setShowPreview(p => !p); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [htmlCode, cssCode, jsCode, tsCode, htmlKey, cssKey, jsKey, tsKey]);

  // Sync to MongoDB with longer debounce (3 seconds)
  useEffect(() => {
    if (dbSyncRef.current) clearTimeout(dbSyncRef.current);
    dbSyncRef.current = setTimeout(() => {
      syncSavedCode({
        batchId: getCurrentBatch(),
        topicSlug,
        partSlug,
        moduleSlug,
        htmlCode,
        cssCode,
        jsCode,
        tsCode,
      });
    }, 3000);
    return () => { if (dbSyncRef.current) clearTimeout(dbSyncRef.current); };
  }, [htmlCode, cssCode, jsCode, tsCode, topicSlug, partSlug, moduleSlug]);

  // Update preview whenever code changes
  useEffect(() => {
    if (!showPreview || !iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    // Clear console logs on code change
    setConsoleLogs([]);

    // Console capture script to inject before user JS
    const consoleCapture = `<script>
(function() {
  var post = function(type, args) {
    window.parent.postMessage({ type: 'console', level: type, message: args.map(function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ') }, '*');
  };
  console.log = function() { post('log', Array.prototype.slice.call(arguments)); };
  console.error = function() { post('error', Array.prototype.slice.call(arguments)); };
  console.warn = function() { post('warn', Array.prototype.slice.call(arguments)); };
  window.onerror = function(msg) { post('error', [msg]); };
})();
</script>`;

    // Combine HTML, CSS, and JS into one document
    let combinedHtml = htmlCode;

    // If HTML doesn't have <style> injection point, add CSS before </head>
    if (cssCode.trim()) {
      if (combinedHtml.includes('</head>')) {
        combinedHtml = combinedHtml.replace('</head>', `<style>\n${cssCode}\n</style>\n</head>`);
      } else {
        combinedHtml = `<style>\n${cssCode}\n</style>\n${combinedHtml}`;
      }
    }

    // Inject console capture before user JS
    if (combinedHtml.includes('</head>')) {
      combinedHtml = combinedHtml.replace('</head>', `${consoleCapture}\n</head>`);
    } else if (combinedHtml.includes('<body')) {
      combinedHtml = combinedHtml.replace('<body', `${consoleCapture}\n<body`);
    } else {
      combinedHtml = `${consoleCapture}\n${combinedHtml}`;
    }

    // Add JS before </body>
    if (jsCode.trim()) {
      if (combinedHtml.includes('</body>')) {
        combinedHtml = combinedHtml.replace('</body>', `<script>\n${jsCode}\n</script>\n</body>`);
      } else {
        combinedHtml = `${combinedHtml}\n<script>\n${jsCode}\n</script>`;
      }
    }

    doc.open();
    doc.write(combinedHtml);
    doc.close();
  }, [htmlCode, cssCode, jsCode, showPreview]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    const code = value ?? '';
    switch (activeFile) {
      case 'html':
        setHtmlCode(code);
        debouncedSave(htmlKey, code);
        onCodeChangeCallback?.(code, 'html');
        break;
      case 'css':
        setCssCode(code);
        debouncedSave(cssKey, code);
        onCodeChangeCallback?.(code, 'css');
        break;
      case 'js':
        setJsCode(code);
        debouncedSave(jsKey, code);
        onCodeChangeCallback?.(code, 'javascript');
        break;
      case 'ts':
        setTsCode(code);
        debouncedSave(tsKey, code);
        onCodeChangeCallback?.(code, 'typescript');
        break;
    }
  }, [activeFile, debouncedSave, htmlKey, cssKey, jsKey, tsKey, onCodeChangeCallback]);

  const handleReset = useCallback(() => {
    setHtmlCode(defaultHtml ?? DEFAULT_HTML);
    setCssCode(defaultCss ?? DEFAULT_CSS);
    setJsCode(defaultJs ?? DEFAULT_JS);
    setTsCode(defaultTs ?? DEFAULT_TS);
    clearEntry(htmlKey);
    clearEntry(cssKey);
    clearEntry(jsKey);
    clearEntry(tsKey);
  }, [defaultHtml, defaultCss, defaultJs, defaultTs, htmlKey, cssKey, jsKey, tsKey]);

  const getCurrentCode = () => {
    switch (activeFile) {
      case 'html': return htmlCode;
      case 'css': return cssCode;
      case 'js': return jsCode;
      case 'ts': return tsCode;
    }
  };

  const getMonacoLanguage = () => {
    switch (activeFile) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
    }
  };

  const fileTabs: { id: FileTab; label: string; color: string }[] = [
    { id: 'html', label: 'index.html', color: '#e44d26' },
    { id: 'css', label: 'style.css', color: '#264de4' },
    { id: 'js', label: 'script.js', color: '#f7df1e' },
    { id: 'ts', label: 'app.ts', color: '#3178c6' },
  ];

  const FileIcon = ({ type, className }: { type: FileTab; className?: string }) => {
    if (type === 'html') return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M4 3l1.778 18L12 23l6.222-2L20 3H4z" fill="#e44d26"/>
        <path d="M12 4.5v17l5-1.75L18.5 4.5H12z" fill="#f16529"/>
        <text x="7" y="16" fontSize="8" fill="white" fontWeight="bold">{'<>'}</text>
      </svg>
    );
    if (type === 'css') return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M4 3l1.778 18L12 23l6.222-2L20 3H4z" fill="#264de4"/>
        <path d="M12 4.5v17l5-1.75L18.5 4.5H12z" fill="#2965f1"/>
        <text x="7.5" y="16" fontSize="7" fill="white" fontWeight="bold">{'{ }'}</text>
      </svg>
    );
    if (type === 'ts') return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#3178c6"/>
        <text x="7" y="17" fontSize="10" fill="white" fontWeight="bold">TS</text>
      </svg>
    );
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#f7df1e"/>
        <text x="8" y="17" fontSize="10" fill="#323330" fontWeight="bold">JS</text>
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor + Preview Split */}
      <div className="flex flex-1 min-h-0">
        {/* Editor Section */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* File Tabs */}
          <div className="flex items-center bg-gray-900 border-b border-gray-700 flex-shrink-0">
            {fileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFile(tab.id)}
                className={`px-3 py-2 text-xs font-medium border-r border-gray-700 transition-colors flex items-center gap-2 ${
                  activeFile === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <FileIcon type={tab.id} className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-0.5 mr-2">
              <button onClick={() => setFontSize(s => Math.max(10, s - 1))} className="px-1.5 py-1 text-xs text-gray-400 hover:text-white" title="Decrease font">A-</button>
              <span className="text-xs text-gray-500">{fontSize}</span>
              <button onClick={() => setFontSize(s => Math.min(24, s + 1))} className="px-1.5 py-1 text-xs text-gray-400 hover:text-white" title="Increase font">A+</button>
            </div>
            <button
              onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}
              className="px-2.5 py-1.5 mr-2 text-xs text-gray-400 hover:text-white transition-colors"
              title="Format code (Shift+Alt+F)"
            >
              ✨ Format
            </button>
            <button
              onClick={() => {
                let combined = htmlCode;
                if (cssCode.trim()) {
                  combined = combined.includes('</head>')
                    ? combined.replace('</head>', `<style>\n${cssCode}\n</style>\n</head>`)
                    : `<style>\n${cssCode}\n</style>\n${combined}`;
                }
                if (jsCode.trim()) {
                  combined = combined.includes('</body>')
                    ? combined.replace('</body>', `<script>\n${jsCode}\n</script>\n</body>`)
                    : `${combined}\n<script>\n${jsCode}\n</script>`;
                }
                const blob = new Blob([combined], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${topicSlug}-project.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-2.5 py-1.5 mr-2 text-xs text-gray-400 hover:text-white transition-colors"
              title="Export combined HTML"
            >
              ⬇ Export
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 mr-2 text-xs text-gray-400 hover:text-white transition-colors"
              title="Reset all files"
            >
              ↺ Reset
            </button>
            <button
              onClick={async () => {
                const code = getCurrentCode();
                if (!code?.trim()) return;
                try {
                  const res = await fetch('/api/share', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: `${topicSlug} - ${activeFile}`,
                      code,
                      language: getMonacoLanguage(),
                    }),
                  });
                  const data = await res.json();
                  if (data.shareId) {
                    // Use NEXT_PUBLIC_BASE_URL if set, otherwise current origin
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
                    const url = `${baseUrl}/share/${data.shareId}`;
                    await navigator.clipboard.writeText(url);
                    alert(`Share link copied!\n${url}`);
                  }
                } catch {
                  alert('Failed to share. Try again.');
                }
              }}
              className="px-2.5 py-1.5 mr-2 text-xs text-gray-400 hover:text-white transition-colors"
              title="Share current file"
            >
              🔗 Share
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language={getMonacoLanguage()}
              value={getCurrentCode()}
              onChange={handleCodeChange}
              onMount={(editor) => { editorRef.current = editor; }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                wordWrap: 'on',
                scrollBeyondLastLine: true,
                automaticLayout: true,
                tabSize: 2,
                scrollbar: { vertical: 'visible', horizontal: 'visible', verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                quickSuggestions: { other: true, comments: false, strings: true },
                parameterHints: { enabled: true },
                suggest: { showKeywords: true, showSnippets: true, showFunctions: true, showVariables: true },
                linkedEditing: true,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <>
            <ResizeHandle
              direction="horizontal"
              onResize={(delta) => {
                const container = document.querySelector('.flex.flex-1.min-h-0');
                if (container) {
                  const totalWidth = container.clientWidth;
                  const deltaPct = (delta / totalWidth) * 100;
                  setPreviewWidth(w => Math.max(20, Math.min(70, w - deltaPct)));
                }
              }}
            />
            <div className="flex flex-col border-l border-gray-700" style={{ width: `${previewWidth}%` }}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700 flex-shrink-0">
              <span className="text-xs font-medium text-gray-300">🖥️ Live Preview</span>
              <button
                onClick={() => setShowPreview(false)}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <iframe
              ref={iframeRef}
              className="flex-1 bg-white w-full"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
            />
            {consoleLogs.length > 0 && (
              <div className="border-t border-gray-700 bg-gray-900 max-h-32 overflow-y-auto p-2 text-xs font-mono">
                {consoleLogs.map((log, i) => (
                  <div key={i} className={`${log.startsWith('[error]') ? 'text-red-400' : log.startsWith('[warn]') ? 'text-yellow-400' : 'text-gray-300'}`}>{log}</div>
                ))}
              </div>
            )}
          </div>
          </>
        )}
      </div>

      {/* Bottom bar */}
      {!showPreview && (
        <div className="flex items-center justify-end px-3 py-1 bg-gray-800 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-500"
          >
            ▶ Show Preview
          </button>
        </div>
      )}
    </div>
  );
}
