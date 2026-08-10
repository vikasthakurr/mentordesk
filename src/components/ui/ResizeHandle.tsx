'use client';

import { useCallback, useRef, useState } from 'react';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

/**
 * A draggable resize handle for split panes.
 */
export default function ResizeHandle({ direction, onResize }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - startPos.current;
      startPos.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`flex-shrink-0 ${
        direction === 'horizontal'
          ? 'w-1.5 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500'
          : 'h-1.5 cursor-row-resize hover:bg-blue-500/50 active:bg-blue-500'
      } ${isDragging ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'} transition-colors`}
      title="Drag to resize"
    />
  );
}
