'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import type { UpdateTableLayoutDto } from '@/api-client';
import type { Table } from '../api/types';
import { percentToPixel, pixelToPercent } from '../lib/layout';
import {
  ZOOM_STEP,
  computeFit,
  computeResize,
  screenToWorld,
  zoomAtPoint
} from '../lib/canvas-view';
import type { Corner, Point } from '../lib/canvas-view';
import TableShape from './table-shape';
import TableSelectionOverlay from './table-selection-overlay';

export interface TableMapCanvasHandle {
  fitToView: () => void;
}

interface TableMapCanvasProps {
  tables: Table[];
  editing: boolean;
  selectedTableId: string | null;
  onSelectedTableIdChange: (id: string | null) => void;
  onUpdateTable: (id: string, layout: UpdateTableLayoutDto) => void;
  onSelectTable: (table: Table) => void;
  onEditRequest: (table: Table) => void;
  onDeleteRequest: (table: Table) => void;
}

/** A table is renderable only once it has a position and size. */
type PlacedTable = Table & {
  positionX: number;
  positionY: number;
  width: number;
  height: number;
};

function isPlaced(table: Table): table is PlacedTable {
  return (
    table.positionX !== null &&
    table.positionY !== null &&
    table.width !== null &&
    table.height !== null
  );
}

const TableMapCanvas = forwardRef<TableMapCanvasHandle, TableMapCanvasProps>(
  function TableMapCanvas(
    {
      tables,
      editing,
      selectedTableId,
      onSelectedTableIdChange,
      onUpdateTable,
      onSelectTable,
      onEditRequest,
      onDeleteRequest
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [resizeOverride, setResizeOverride] = useState<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);
    const [overlayRect, setOverlayRect] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

    const selectedIdRef = useRef(selectedTableId);
    selectedIdRef.current = selectedTableId;

    const resizeSessionRef = useRef<{
      id: string;
      corner: Corner;
      worldRect: { x: number; y: number; width: number; height: number };
      scale: number;
      pos: Point;
    } | null>(null);

    const placedTables = tables.filter(isPlaced);
    const selectedTable = placedTables.find((t) => t.id === selectedTableId) ?? null;

    const fitToView = useCallback(() => {
      const stage = stageRef.current;
      if (!stage || size.width <= 0 || size.height <= 0) return;

      if (placedTables.length === 0) {
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });
        return;
      }

      const minX = Math.min(...placedTables.map((t) => percentToPixel(t.positionX, size.width)));
      const minY = Math.min(...placedTables.map((t) => percentToPixel(t.positionY, size.height)));
      const maxX = Math.max(
        ...placedTables.map(
          (t) => percentToPixel(t.positionX, size.width) + percentToPixel(t.width, size.width)
        )
      );
      const maxY = Math.max(
        ...placedTables.map(
          (t) => percentToPixel(t.positionY, size.height) + percentToPixel(t.height, size.height)
        )
      );

      const { scale, position } = computeFit({ minX, minY, maxX, maxY }, size);
      stage.scale({ x: scale, y: scale });
      stage.position(position);
    }, [placedTables, size]);

    useImperativeHandle(ref, () => ({ fitToView }), [fitToView]);

    useEffect(() => {
      const node = containerRef.current;
      if (!node) return;

      const measure = () => {
        setSize({ width: node.clientWidth, height: node.clientHeight });
      };
      measure();

      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const factor = e.evt.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP;
      const result = zoomAtPoint(stage.scaleX(), { x: stage.x(), y: stage.y() }, pointer, factor);

      stage.scale({ x: result.scale, y: result.scale });
      stage.position(result.position);
    }, []);

    // Only pan when the drag starts on empty canvas (the stage itself), so a
    // drag starting on a table shape still moves that table, not the view.
    const handleStageMouseDown = useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage) stage.draggable(e.target === stage);
        if (e.target === stage && editing) {
          onSelectedTableIdChange(null);
        }
      },
      [editing, onSelectedTableIdChange]
    );

    const handleStageMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (stage) stage.draggable(false);
    }, []);

    const handleDragEnd = useCallback(
      (id: string, x: number, y: number) => {
        onUpdateTable(id, {
          positionX: pixelToPercent(x, size.width),
          positionY: pixelToPercent(y, size.height)
        });
      },
      [onUpdateTable, size]
    );

    const handleTableSelect = useCallback(
      (table: Table) => {
        if (editing) onSelectedTableIdChange(table.id);
        else onSelectTable(table);
      },
      [editing, onSelectedTableIdChange, onSelectTable]
    );

    /**
     * Recompute the selection overlay rect from the selected node's actual
     * on-screen render (getClientRect accounts for the Stage's scale/position),
     * never from raw percentage coordinates + a separately-tracked zoom.
     *
     * Targets the table's RIM node (`#table-rim-<id>`) rather than the whole
     * table Group — the Group's bounding box also includes the chairs, which
     * extend beyond the rim and would offset the selection box and inflate the
     * resize math.
     */
    const syncOverlay = useCallback(() => {
      const stage = stageRef.current;
      const id = selectedIdRef.current;
      if (!stage || !id) {
        setOverlayRect(null);
        return;
      }
      const node = stage.findOne(`#table-rim-${id}`);
      if (!node) {
        setOverlayRect(null);
        return;
      }
      const rect = node.getClientRect({ skipStroke: true });
      setOverlayRect({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    }, []);

    // Re-sync on React-driven changes (selection, size, live resize, tables, edit mode).
    useEffect(() => {
      syncOverlay();
    }, [syncOverlay, selectedTableId, size, resizeOverride, tables, editing]);

    // Re-sync on Konva-only transform changes (zoom/pan) that don't re-render React.
    useEffect(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const events = ['wheel', 'dragmove', 'dragend'] as const;
      events.forEach((evt) => stage.on(evt, syncOverlay));
      return () => {
        events.forEach((evt) => stage.off(evt, syncOverlay));
      };
    }, [syncOverlay, size]);

    const toCanvasPoint = useCallback((clientX: number, clientY: number): Point => {
      const el = containerRef.current;
      if (!el) return { x: clientX, y: clientY };
      const r = el.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    }, []);

    const handleResizeStart = useCallback((corner: Corner) => {
      const stage = stageRef.current;
      const id = selectedIdRef.current;
      if (!stage || !id) return;
      const node = stage.findOne(`#table-rim-${id}`);
      if (!node) return;

      const rect = node.getClientRect({ skipStroke: true });
      const scale = stage.scaleX();
      const pos = { x: stage.x(), y: stage.y() };
      resizeSessionRef.current = {
        id,
        corner,
        scale,
        pos,
        worldRect: {
          x: (rect.x - pos.x) / scale,
          y: (rect.y - pos.y) / scale,
          width: rect.width / scale,
          height: rect.height / scale
        }
      };
    }, []);

    const applyResize = useCallback(
      (corner: Corner, pointer: Point, persist: boolean) => {
        const session = resizeSessionRef.current;
        if (!session) return;

        const worldPointer = screenToWorld(pointer, session.scale, session.pos);
        const next = computeResize(corner, worldPointer, session.worldRect);

        if (persist) {
          onUpdateTable(session.id, {
            width: pixelToPercent(next.width, size.width),
            height: pixelToPercent(next.height, size.height),
            positionX: pixelToPercent(next.x, size.width),
            positionY: pixelToPercent(next.y, size.height)
          });
          setResizeOverride(null);
          resizeSessionRef.current = null;
        } else {
          setResizeOverride({
            id: session.id,
            x: next.x,
            y: next.y,
            width: next.width,
            height: next.height
          });
        }
      },
      [onUpdateTable, size]
    );

    const handleResizeMove = useCallback(
      (corner: Corner, pointer: Point) => applyResize(corner, pointer, false),
      [applyResize]
    );

    const handleResizeEnd = useCallback(
      (corner: Corner, pointer: Point) => applyResize(corner, pointer, true),
      [applyResize]
    );

    return (
      <div
        ref={containerRef}
        data-testid='table-map-canvas'
        className='relative h-full w-full overflow-hidden bg-slate-50'
      >
        {size.width > 0 && size.height > 0 && (
          <Stage
            ref={stageRef}
            width={size.width}
            height={size.height}
            onMouseDown={handleStageMouseDown}
            onMouseUp={handleStageMouseUp}
            onWheel={handleWheel}
          >
            <Layer>
              {placedTables.map((table) => {
                const override =
                  resizeOverride && resizeOverride.id === table.id ? resizeOverride : null;
                return (
                  <TableShape
                    key={table.id}
                    table={table}
                    x={override ? override.x : percentToPixel(table.positionX, size.width)}
                    y={override ? override.y : percentToPixel(table.positionY, size.height)}
                    width={override ? override.width : percentToPixel(table.width, size.width)}
                    height={override ? override.height : percentToPixel(table.height, size.height)}
                    editing={editing}
                    onDragEnd={handleDragEnd}
                    onDragMove={syncOverlay}
                    onSelect={handleTableSelect}
                  />
                );
              })}
            </Layer>
          </Stage>
        )}

        {editing && selectedTable && overlayRect && (
          <TableSelectionOverlay
            rect={overlayRect}
            table={selectedTable}
            onEdit={onEditRequest}
            onDelete={onDeleteRequest}
            onResizeStart={handleResizeStart}
            onResizeMove={handleResizeMove}
            onResizeEnd={handleResizeEnd}
            toCanvasPoint={toCanvasPoint}
          />
        )}
      </div>
    );
  }
);

export default TableMapCanvas;
