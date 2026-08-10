'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildStorageKey, saveCode, loadCode, clearEntry } from '@/lib/session-storage';
import { syncSavedCode } from '@/lib/api-client';
import { getCurrentBatch } from '@/lib/batch';

export interface DiagramEditorProps {
  topicSlug: string;
  partSlug: string;
  moduleSlug: string;
  initialData?: any[];
}

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'text';

/**
 * DiagramEditor — A simple canvas-based drawing board for notes and diagrams.
 * Supports freehand drawing, shapes, arrows, and text.
 */
export default function DiagramEditor({
  topicSlug,
  partSlug,
  moduleSlug,
}: DiagramEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const storageKey = buildStorageKey(partSlug, moduleSlug, topicSlug, 'diagram') + ':canvas';

  // Save canvas state
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    saveCode(storageKey, dataUrl);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(dataUrl);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [storageKey, historyIndex]);

  // Load saved canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to a large fixed size (scrollable)
    canvas.width = 2000;
    canvas.height = 2000;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a subtle grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Load saved state
    const saved = loadCode(storageKey);
    if (saved) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHistory([saved]);
        setHistoryIndex(0);
      };
      img.src = saved;
    } else {
      const initial = canvas.toDataURL();
      setHistory([initial]);
      setHistoryIndex(0);
    }
  }, [storageKey, topicSlug]);

  // Canvas is fixed size (2000x2000), no resize needed

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL();
        saveCode(storageKey, dataUrl);
        // Sync drawing to MongoDB
        syncSavedCode({
          batchId: getCurrentBatch(),
          topicSlug,
          partSlug,
          moduleSlug,
          htmlCode: '',
          cssCode: '',
          jsCode: '',
          tsCode: '',
          drawingData: dataUrl,
        });
      }
    };
  }, [storageKey, topicSlug, partSlug, moduleSlug]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    setIsDrawing(true);
    startPos.current = pos;
    lastPos.current = pos;

    if (tool === 'pen' || tool === 'eraser') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    }

    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.font = `${lineWidth * 8}px sans-serif`;
          ctx.fillStyle = color;
          ctx.fillText(text, pos.x, pos.y);
          saveState();
        }
      }
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastPos.current = pos;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !startPos.current || !lastPos.current) return;

    const start = startPos.current;
    const end = lastPos.current;

    if (tool === 'rectangle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (tool === 'circle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      const cx = start.x + (end.x - start.x) / 2;
      const cy = start.y + (end.y - start.y) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'arrow') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      // Arrowhead
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = 15;
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }

    saveState();
  };

  // Touch event handlers for mobile/tablet support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    setIsDrawing(true);
    startPos.current = pos;
    lastPos.current = pos;

    if (tool === 'pen' || tool === 'eraser') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    }

    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.font = `${lineWidth * 8}px sans-serif`;
          ctx.fillStyle = color;
          ctx.fillText(text, pos.x, pos.y);
          saveState();
        }
      }
      setIsDrawing(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getTouchPos(e);

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastPos.current = pos;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
      saveCode(storageKey, history[newIndex]);
    };
    img.src = history[newIndex];
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
      saveCode(storageKey, history[newIndex]);
    };
    img.src = history[newIndex];
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    clearEntry(storageKey);
    saveState();
  };

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: 'pen', icon: '✏️', label: 'Pen' },
    { id: 'eraser', icon: '🧽', label: 'Eraser' },
    { id: 'rectangle', icon: '▭', label: 'Rectangle' },
    { id: 'circle', icon: '○', label: 'Circle' },
    { id: 'arrow', icon: '→', label: 'Arrow' },
    { id: 'text', icon: 'T', label: 'Text' },
  ];

  const colors = ['#000000', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#7048e8', '#ffffff'];

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex-wrap">
        {/* Tools */}
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              tool === t.id ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 border border-gray-300 dark:border-gray-600'
            }`}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Colors */}
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${
              color === c ? 'border-blue-500 scale-110' : 'border-gray-300 dark:border-gray-600'
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Line Width */}
        <select
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="px-1.5 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
        >
          <option value={1}>Thin</option>
          <option value={2}>Normal</option>
          <option value={4}>Thick</option>
          <option value={8}>Bold</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Actions */}
        <button onClick={undo} className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Undo">
          ↩
        </button>
        <button onClick={redo} className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Redo">
          ↪
        </button>
        <button onClick={clearCanvas} className="px-2 py-1 text-xs text-red-600 bg-white border border-red-300 rounded hover:bg-red-50" title="Clear">
          🗑️ Clear
        </button>
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const link = document.createElement('a');
            link.download = `${topicSlug}-drawing.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="px-2 py-1 text-xs text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50"
          title="Download as PNG"
        >
          💾 Download
        </button>
      </div>

      {/* Canvas - scrollable large canvas */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto cursor-crosshair bg-gray-50 dark:bg-gray-800">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="block"
          style={{ width: '2000px', height: '2000px', touchAction: 'none' }}
        />
      </div>
    </div>
  );
}
