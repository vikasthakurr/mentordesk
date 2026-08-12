'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SharedCodeViewerProps {
  title: string;
  code: string;
  language: string;
  shareId: string;
}

export default function SharedCodeViewer({ title, code, language, shareId }: SharedCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">M</div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">MentorDesk</span>
          </Link>
          <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            Shared snippet • expires in 7 days
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">Language: {language}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Copy Link
            </button>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <span className="text-xs text-gray-400">{language}</span>
            <span className="text-xs text-gray-500">ID: {shareId}</span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm text-gray-200 font-mono leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to MentorDesk
          </Link>
        </div>
      </div>
    </div>
  );
}
