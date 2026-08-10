'use client';

import { useMemo, useState } from 'react';
import { useTheme } from '@/lib/theme';

interface NodeEditorProps {
  topicSlug: string;
}

type Template = 'node' | 'react' | 'react-ts' | 'nextjs' | 'express';

const templates: { id: Template; label: string; icon: string; description: string }[] = [
  { id: 'node', label: 'Node.js', icon: '🟢', description: 'Plain Node.js' },
  { id: 'react', label: 'React', icon: '⚛️', description: 'React + Vite' },
  { id: 'react-ts', label: 'React TS', icon: '🔷', description: 'React + TypeScript' },
  { id: 'nextjs', label: 'Next.js', icon: '▲', description: 'Next.js App' },
  { id: 'express', label: 'Express', icon: '🚂', description: 'Express Server' },
];

// StackBlitz fork URLs - creates a fresh editable copy for each user
const templateUrls: Record<Template, string> = {
  node: 'https://stackblitz.com/fork/node?embed=1&file=index.js&theme=dark',
  react: 'https://stackblitz.com/fork/react?embed=1&file=src/App.js&theme=dark',
  'react-ts': 'https://stackblitz.com/fork/react-ts?embed=1&file=src/App.tsx&theme=dark',
  nextjs: 'https://stackblitz.com/fork/nextjs?embed=1&file=app/page.tsx&theme=dark',
  express: 'https://stackblitz.com/fork/express?embed=1&file=index.js&theme=dark',
};

/**
 * NodeEditor - Embeds StackBlitz as an iframe for running full projects.
 * Supports Node.js, React, React+TS, Next.js, and Express templates.
 */
export default function NodeEditor({ topicSlug }: NodeEditorProps) {
  const [activeTemplate, setActiveTemplate] = useState<Template>('react');
  const { theme } = useTheme();

  const embedUrl = useMemo(() => {
    const base = templateUrls[activeTemplate];
    return base.replace('theme=dark', `theme=${theme === 'dark' ? 'dark' : 'light'}`);
  }, [activeTemplate, theme]);

  return (
    <div className="flex flex-col w-full h-full bg-gray-900">
      {/* Header with template selector */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-1">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                activeTemplate === t.id
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={t.description}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <a
          href={templateUrls[activeTemplate].replace('/embed/', '/s/')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0"
        >
          Open full ↗
        </a>
      </div>

      {/* StackBlitz Iframe */}
      <iframe
        key={activeTemplate}
        src={embedUrl}
        className="flex-1 w-full border-0"
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        title={`${activeTemplate} Sandbox`}
      />
    </div>
  );
}
