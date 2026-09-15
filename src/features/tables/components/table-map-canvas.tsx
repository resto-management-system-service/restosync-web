'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import type { UpdateTableLayoutDto } from '@/api-client';
import type { Table } from '../api/types';
import { percentToPixel, pixelToPercent } from '../lib/layout';
import { ZOOM_STEP, computeFit, zoomAtPoint } from '../lib/canvas-view';
import TableShape from './table-shape';

export interface TableMapCanvasHandle {
  fitToView: () => void;
}

interface TableMapCanvasProps {
  tables: Table[];
  editing: boolean;
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
    { tables, editing, onUpdateTable, onSelectTable, onEditRequest, onDeleteRequest },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [resizeOverride, setResizeOverride] = useState<{
      id: string;
      width: number;
      height: number;
    } | null>(null);

    const placedTables = tables.filter(isPlaced);

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
    const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (stage) stage.draggable(e.target === stage);
    }, []);

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

    const handleResize = useCallback((id: string, width: number, height: number) => {
      setResizeOverride({ id, width, height });
    }, []);

    const handleResizeEnd = useCallback(
      (id: string, width: number, height: number) => {
        setResizeOverride(null);
        onUpdateTable(id, {
          width: pixelToPercent(width, size.width),
          height: pixelToPercent(height, size.height)
        });
      },
      [onUpdateTable, size]
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
                    x={percentToPixel(table.positionX, size.width)}
                    y={percentToPixel(table.positionY, size.height)}
                    width={override ? override.width : percentToPixel(table.width, size.width)}
                    height={override ? override.height : percentToPixel(table.height, size.height)}
                    editing={editing}
                    onDragEnd={handleDragEnd}
                    onResize={handleResize}
                    onResizeEnd={handleResizeEnd}
                    onSelect={onSelectTable}
                    onEditRequest={onEditRequest}
                    onDeleteRequest={onDeleteRequest}
                  />
                );
              })}
            </Layer>
          </Stage>
        )}
      </div>
    );
  }
);

export default TableMapCanvas;
