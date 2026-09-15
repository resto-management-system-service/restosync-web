'use client';

import { useRef } from 'react';

interface CanvasResizeHandleProps {
  onDragStart: () => void;
  onDragMove: (deltaY: number) => void;
  onDragEnd?: () => void;
}

/**
 * Bottom-edge drag handle that resizes the canvas container's height.
 * Dragging down grows the panel; dragging up shrinks it.
 */
export default function CanvasResizeHandle({
  onDragStart,
  onDragMove,
  onDragEnd
}: CanvasResizeHandleProps) {
  const startYRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
    onDragStart();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    onDragMove(e.clientY - startYRef.current);
  };

  const handlePointerEnd = () => {
    if (startYRef.current === null) return;
    startYRef.current = null;
    onDragEnd?.();
  };

  return (
    <div
      data-testid='canvas-resize-handle'
      role='separator'
      aria-orientation='horizontal'
      aria-label='Ajustar alto del mapa'
      className='flex h-2 w-full cursor-ns-resize items-center justify-center bg-muted transition-colors hover:bg-accent'
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    />
  );
}
