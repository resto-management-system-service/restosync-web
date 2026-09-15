'use client';

import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { toast } from 'sonner';
import { Circle, Group, Rect, Text } from 'react-konva';
import type { Table } from '../api/types';
import { CHAIR_COLOR, CHAIR_RADIUS, STATUS_COLORS, chairOffsets } from '../lib/layout';

const HANDLE_SIZE = 14;
const MIN_SIZE_PX = 40;
const DISABLED_OPACITY = 0.35;
const BLOCKED_MESSAGE = 'No se puede editar o eliminar una mesa reservada u ocupada';

interface TableShapeProps {
  table: Table;
  x: number;
  y: number;
  width: number;
  height: number;
  editing: boolean;
  onDragEnd: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onResizeEnd: (id: string, width: number, height: number) => void;
  onSelect: (table: Table) => void;
  onEditRequest: (table: Table) => void;
  onDeleteRequest: (table: Table) => void;
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
  onEditRequest,
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
  const shape = table.shape ?? 'rounded';
  const chairs = chairOffsets(shape, table.capacity ?? 0, width, height);
  const labelFontSize = Math.max(11, Math.min(width, height) * 0.3);
  const isAvailable = table.status === 'AVAILABLE';

  const handleEditClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    if (!isAvailable) {
      toast.warning(BLOCKED_MESSAGE);
      return;
    }
    onEditRequest(table);
  };

  const handleDeleteClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    if (!isAvailable) {
      toast.warning(BLOCKED_MESSAGE);
      return;
    }
    onDeleteRequest(table);
  };

  return (
    <Group
      name='table-body'
      x={x}
      y={y}
      draggable={editing}
      onClick={() => {
        if (editing) {
          if (isAvailable) onEditRequest(table);
          else toast.warning(BLOCKED_MESSAGE);
        } else {
          onSelect(table);
        }
      }}
      onTap={() => {
        if (editing) {
          if (isAvailable) onEditRequest(table);
          else toast.warning(BLOCKED_MESSAGE);
        } else {
          onSelect(table);
        }
      }}
      onDragEnd={(e) => onDragEnd(table.id, e.target.x(), e.target.y())}
    >
      {shape === 'circle' ? (
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
          cornerRadius={shape === 'rounded' ? 8 : 0}
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
            name='table-delete'
            x={-12}
            y={-12}
            opacity={isAvailable ? 1 : DISABLED_OPACITY}
            onClick={handleDeleteClick}
            onTap={handleDeleteClick}
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
            name='table-edit'
            x={width + 12}
            y={-12}
            opacity={isAvailable ? 1 : DISABLED_OPACITY}
            onClick={handleEditClick}
            onTap={handleEditClick}
          >
            <Circle radius={11} fill='#0f172a' />
            <Text
              text='\u270e'
              fontSize={13}
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
            name='table-resize'
            x={0}
            y={0}
            draggable
            onClick={(e) => {
              e.cancelBubble = true;
            }}
            onTap={(e) => {
              e.cancelBubble = true;
            }}
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
