import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { Circle, Group, Rect, Text } from 'react-konva';
import type { TableLayout } from '../api/mock-data';
import { CHAIR_COLOR, CHAIR_RADIUS, STATUS_COLORS, chairOffsets } from '../lib/layout';

const HANDLE_SIZE = 14;
const MIN_SIZE_PX = 40;

interface TableShapeProps {
  table: TableLayout;
  x: number;
  y: number;
  width: number;
  height: number;
  editing: boolean;
  onDragEnd: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onResizeEnd: (id: string, width: number, height: number) => void;
  onSelect: (table: TableLayout) => void;
  onDeleteRequest: (table: TableLayout) => void;
}

export default function TableShape({
  table,
  x,
  y,
  width,
  height,
  editing,
  onDragEnd,
  onResize,
  onResizeEnd,
  onSelect,
  onDeleteRequest
}: TableShapeProps) {
  const handleRef = useRef<Konva.Group>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!draggingRef.current) {
      handleRef.current?.position({ x: width - HANDLE_SIZE / 2, y: height - HANDLE_SIZE / 2 });
    }
  }, [width, height]);

  const colors = STATUS_COLORS[table.status];
  const chairs = chairOffsets(table.shape, table.capacity, width, height);
  const labelFontSize = Math.max(11, Math.min(width, height) * 0.3);

  return (
    <Group
      x={x}
      y={y}
      draggable={editing}
      onClick={() => {
        if (!editing) onSelect(table);
      }}
      onTap={() => {
        if (!editing) onSelect(table);
      }}
      onDragEnd={(e) => onDragEnd(table.id, e.target.x(), e.target.y())}
    >
      {table.shape === 'round' ? (
        <Circle
          x={width / 2}
          y={height / 2}
          radius={Math.min(width, height) / 2}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={2}
          listening={false}
        />
      ) : (
        <Rect
          width={width}
          height={height}
          cornerRadius={8}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={2}
          listening={false}
        />
      )}

      {chairs.map((chair, index) => (
        <Circle
          key={index}
          x={chair.x}
          y={chair.y}
          radius={CHAIR_RADIUS}
          fill={CHAIR_COLOR.fill}
          stroke={CHAIR_COLOR.stroke}
          strokeWidth={1.5}
          listening={false}
        />
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

      {editing && (
        <>
          <Group
            x={-12}
            y={-12}
            onClick={() => onDeleteRequest(table)}
            onTap={() => onDeleteRequest(table)}
          >
            <Circle radius={11} fill='#0f172a' />
            <Text
              text='\u00d7'
              fontSize={16}
              fontStyle='bold'
              fill='#ffffff'
              x={-11}
              y={-11}
              width={22}
              height={22}
              align='center'
              verticalAlign='middle'
              listening={false}
            />
          </Group>

          <Group
            ref={handleRef}
            x={0}
            y={0}
            draggable
            onDragStart={() => {
              draggingRef.current = true;
            }}
            onDragMove={(e) => {
              const half = HANDLE_SIZE / 2;
              onResize(
                table.id,
                Math.max(MIN_SIZE_PX, e.target.x() + half),
                Math.max(MIN_SIZE_PX, e.target.y() + half)
              );
            }}
            onDragEnd={(e) => {
              draggingRef.current = false;
              const half = HANDLE_SIZE / 2;
              onResizeEnd(
                table.id,
                Math.max(MIN_SIZE_PX, e.target.x() + half),
                Math.max(MIN_SIZE_PX, e.target.y() + half)
              );
            }}
          >
            <Rect
              width={HANDLE_SIZE}
              height={HANDLE_SIZE}
              offsetX={HANDLE_SIZE / 2}
              offsetY={HANDLE_SIZE / 2}
              fill='#ffffff'
              stroke='#0f172a'
              strokeWidth={1.5}
              cornerRadius={3}
            />
          </Group>
        </>
      )}
    </Group>
  );
}
