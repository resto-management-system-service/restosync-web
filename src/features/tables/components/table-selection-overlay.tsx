'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Table } from '../api/types';
import type { Corner, Point } from '../lib/canvas-view';
import { STATUS_LABEL } from '../lib/layout';

const HANDLE_SIZE = 12;
/** Gap (px) between the selection box's edge and the options tab. */
const TAB_OFFSET = 12;
/** Width/height (px) of the options tab. */
const TAB_SIZE = 22;
/** Gap (px) between the tab and the options panel. */
const PANEL_GAP = 4;
const PANEL_CLOSE_DELAY_MS = 150;
const BLOCKED_MESSAGE = 'No se puede editar o eliminar una mesa reservada u ocupada';

interface TableSelectionOverlayProps {
  /** Selected table's rendered rect in container (screen) coordinates. */
  rect: { x: number; y: number; width: number; height: number };
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  onResizeStart: (corner: Corner) => void;
  onResizeMove: (corner: Corner, pointer: Point) => void;
  onResizeEnd: (corner: Corner, pointer: Point) => void;
  /** Map a DOM client position to container (canvas) coordinates. */
  toCanvasPoint: (clientX: number, clientY: number) => Point;
}

const HANDLE_CURSOR: Record<Corner, string> = {
  tl: 'nwse-resize',
  tr: 'nesw-resize',
  bl: 'nesw-resize',
  br: 'nwse-resize'
};

export default function TableSelectionOverlay({
  rect,
  table,
  onEdit,
  onDelete,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  toCanvasPoint
}: TableSelectionOverlayProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeCorner, setActiveCorner] = useState<Corner | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAvailable = table.status === 'AVAILABLE';

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setPanelOpen(false), PANEL_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const openPanel = useCallback(() => {
    clearCloseTimer();
    setPanelOpen(true);
  }, [clearCloseTimer]);

  const handlePointerDown = (corner: Corner) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveCorner(corner);
    onResizeStart(corner);
  };

  const handlePointerMove = (corner: Corner) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeCorner !== corner) return;
    onResizeMove(corner, toCanvasPoint(e.clientX, e.clientY));
  };

  const handlePointerEnd = (corner: Corner) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeCorner !== corner) return;
    setActiveCorner(null);
    onResizeEnd(corner, toCanvasPoint(e.clientX, e.clientY));
  };

  const handleRowClick = (action: () => void) => {
    if (!isAvailable) {
      toast.warning(BLOCKED_MESSAGE);
      return;
    }
    action();
  };

  return (
    <div
      data-testid='table-selection-overlay'
      className='pointer-events-none absolute'
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
    >
      {/* Dashed selection outline */}
      <div
        data-testid='selection-box'
        className='absolute inset-0 border-2 border-dashed border-slate-900'
      />

      {/* Four corner-only resize handles */}
      {(Object.keys(HANDLE_CURSOR) as Corner[]).map((corner) => (
        <div
          key={corner}
          data-testid={`resize-handle-${corner}`}
          role='button'
          tabIndex={0}
          aria-label={`Ajustar tamaño ${corner}`}
          className='pointer-events-auto absolute h-3 w-3 border-2 border-slate-900 bg-white'
          style={{
            cursor: HANDLE_CURSOR[corner],
            left:
              corner === 'tr' || corner === 'br' ? rect.width - HANDLE_SIZE / 2 : -HANDLE_SIZE / 2,
            top:
              corner === 'bl' || corner === 'br' ? rect.height - HANDLE_SIZE / 2 : -HANDLE_SIZE / 2
          }}
          onPointerDown={handlePointerDown(corner)}
          onPointerMove={handlePointerMove(corner)}
          onPointerUp={handlePointerEnd(corner)}
          onPointerCancel={handlePointerEnd(corner)}
        />
      ))}

      {/* Tab (settings icon) just outside the right edge, vertically centered */}
      <div
        data-testid='selection-tab'
        role='button'
        tabIndex={0}
        aria-label='Opciones de mesa'
        className='pointer-events-auto absolute flex items-center justify-center rounded-md bg-slate-900 text-white'
        style={{
          left: rect.width + TAB_OFFSET,
          top: rect.height / 2,
          width: TAB_SIZE,
          height: TAB_SIZE,
          transform: 'translateY(-50%)',
          cursor: 'pointer'
        }}
        onMouseEnter={openPanel}
        onMouseLeave={scheduleClose}
      >
        <Icons.adjustments className='h-3.5 w-3.5' />
      </div>

      {/* Hover-triggered options panel (positioned just to the right of the tab) */}
      {panelOpen && (
        <div
          data-testid='selection-panel'
          className='pointer-events-auto absolute z-10 w-40 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md'
          style={{
            left: rect.width + TAB_OFFSET + TAB_SIZE + PANEL_GAP,
            top: rect.height / 2,
            transform: 'translateY(-50%)'
          }}
          onMouseEnter={openPanel}
          onMouseLeave={scheduleClose}
        >
          <div
            data-testid='selection-panel-header'
            className='truncate border-b px-3 py-2 text-xs font-medium text-muted-foreground'
          >
            {table.name} · {STATUS_LABEL[table.status]}
          </div>
          <button
            type='button'
            onClick={() => handleRowClick(() => onEdit(table))}
            aria-disabled={!isAvailable}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent',
              !isAvailable && 'cursor-not-allowed opacity-50'
            )}
          >
            <Icons.edit className='h-4 w-4' /> Editar mesa
          </button>
          <button
            type='button'
            onClick={() => handleRowClick(() => onDelete(table))}
            aria-disabled={!isAvailable}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-accent',
              !isAvailable && 'cursor-not-allowed opacity-50'
            )}
          >
            <Icons.trash className='h-4 w-4' /> Eliminar mesa
          </button>
        </div>
      )}
    </div>
  );
}
