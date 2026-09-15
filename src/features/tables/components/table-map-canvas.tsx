'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import type { UpdateTableLayoutDto } from '@/api-client';
import type { Table } from '../api/types';
import { percentToPixel, pixelToPercent } from '../lib/layout';
import TableShape from './table-shape';

interface TableMapCanvasProps {
  tables: Table[];
  editing: boolean;
  onUpdateTable: (id: string, layout: UpdateTableLayoutDto) => void;
  onSelectTable: (table: Table) => void;
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

export default function TableMapCanvas({
  tables,
  editing,
  onUpdateTable,
  onSelectTable,
  onDeleteRequest
}: TableMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [resizeOverride, setResizeOverride] = useState<{
    id: string;
    width: number;
    height: number;
  } | null>(null);

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

  const placedTables = tables.filter(isPlaced);

  return (
    <div ref={containerRef} className='relative h-full min-h-[400px] w-full overflow-hidden'>
      {size.width > 0 && size.height > 0 && (
        <Stage width={size.width} height={size.height}>
          <Layer>
            <Rect width={size.width} height={size.height} fill='#f8fafc' listening={false} />
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
