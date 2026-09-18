'use client';

import Konva from 'konva';
import { Circle, Group, Rect, Text } from 'react-konva';
import type { Table } from '../api/types';
import {
  CHAIR_COLOR,
  CHAIR_DOT_RADIUS,
  CHAIR_RADIUS,
  STATUS_COLORS,
  TABLE_INSET,
  chairOffsets,
  computeLabelFontSize
} from '../lib/layout';

/** Set the pointer cursor on the stage container (Konva cursor-on-hover pattern). */
function setStageCursor(node: Konva.Node, cursor: string): void {
  const stage = node.getStage();
  if (stage) stage.container().style.cursor = cursor;
}

interface TableShapeProps {
  table: Table;
  x: number;
  y: number;
  width: number;
  height: number;
  editing: boolean;
  onDragEnd: (id: string, x: number, y: number) => void;
  /** Fires on every body drag-move so the selection overlay can re-sync. */
  onDragMove?: (id: string) => void;
  /** Body click/tap — selects in edit mode, opens the order in view mode. */
  onSelect: (table: Table) => void;
}

export default function TableShape({
  table,
  x,
  y,
  width,
  height,
  editing,
  onDragEnd,
  onDragMove,
  onSelect
}: TableShapeProps) {
  const colors = STATUS_COLORS[table.status];
  const shape = table.shape ?? 'rounded';
  const chairs = chairOffsets(shape, table.capacity ?? 0, width, height);
  const labelFontSize = computeLabelFontSize(width, height, table.name);

  return (
    <Group
      id={`table-${table.id}`}
      name='table-body'
      x={x}
      y={y}
      draggable={editing}
      onMouseDown={() => {
        if (editing) onSelect(table);
      }}
      onClick={() => onSelect(table)}
      onTap={() => onSelect(table)}
      onMouseEnter={(e) => {
        if (editing) setStageCursor(e.target, 'grab');
      }}
      onMouseLeave={(e) => {
        setStageCursor(e.target, 'default');
      }}
      onDragStart={(e) => {
        setStageCursor(e.target, 'grabbing');
      }}
      onDragMove={() => {
        onDragMove?.(table.id);
      }}
      onDragEnd={(e) => {
        setStageCursor(e.target, 'grab');
        onDragEnd(table.id, e.target.x(), e.target.y());
      }}
    >
      {shape === 'circle' ? (
        <>
          {/* The rim is the table's hit region: it MUST stay listening or clicks
              and drags fall through to the Stage (which then pans the canvas). */}
          <Circle
            id={`table-rim-${table.id}`}
            x={width / 2}
            y={height / 2}
            radius={Math.min(width, height) / 2}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={2}
          />
          <Circle
            x={width / 2}
            y={height / 2}
            radius={Math.min(width, height) / 2 - TABLE_INSET}
            fill={colors.tabletop}
            stroke={colors.stroke}
            strokeWidth={1.5}
            listening={false}
          />
        </>
      ) : (
        <>
          <Rect
            id={`table-rim-${table.id}`}
            width={width}
            height={height}
            cornerRadius={shape === 'rounded' ? 8 : 0}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={2}
          />
          <Rect
            x={TABLE_INSET}
            y={TABLE_INSET}
            width={width - TABLE_INSET * 2}
            height={height - TABLE_INSET * 2}
            cornerRadius={shape === 'rounded' ? 4 : 2}
            fill={colors.tabletop}
            stroke={colors.stroke}
            strokeWidth={1.5}
            listening={false}
          />
        </>
      )}

      {chairs.map((chair, index) => (
        <Group key={index} name='table-chair' x={chair.x} y={chair.y} listening={false}>
          <Circle
            radius={CHAIR_RADIUS}
            fill={CHAIR_COLOR.fill}
            stroke={CHAIR_COLOR.stroke}
            strokeWidth={1.5}
          />
          <Circle radius={CHAIR_DOT_RADIUS} fill={CHAIR_COLOR.dot} />
        </Group>
      ))}

      <Text
        text={table.name}
        fontSize={labelFontSize}
        fontStyle='bold'
        fill={colors.label}
        align='center'
        verticalAlign='middle'
        width={width}
        height={height}
        listening={false}
      />
    </Group>
  );
}
