import { v4 as uuid } from 'uuid';

// ============================================================
// Tables Mock Data Layer (temporary)
// ============================================================
// In-memory stand-in for the real restosync-api Zone/Table models. The
// function signatures mirror what the eventual TanStack Query hooks will
// call, so swapping these out for real API calls later is a drop-in change.
//
// Positions and sizes are stored as percentages (0.0–1.0) of the canvas
// dimensions — never raw pixels.

export interface TableLayout {
  id: string;
  name: string;
  capacity: 2 | 4 | 6 | 8;
  status: 'available' | 'reserved' | 'occupied';
  shape: 'round' | 'square';
  zoneId: string;
  positionX: number; // 0-1
  positionY: number; // 0-1
  width: number; // 0-1
  height: number; // 0-1
}

export interface Zone {
  id: string;
  name: string;
  sortOrder: number;
}

export type TableStatus = TableLayout['status'];
export type TableShape = TableLayout['shape'];
export type TableCapacity = TableLayout['capacity'];

/** Position/size fields persisted for a table (all percentages). */
export interface TableLayoutUpdate {
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

export interface CreateTableInput {
  name: string;
  capacity: TableCapacity;
  shape: TableShape;
  zoneId: string;
}

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

const initialZones: Zone[] = [
  { id: 'zone-piso-1', name: 'Piso 1', sortOrder: 0 },
  { id: 'zone-piso-2', name: 'Piso 2', sortOrder: 1 },
  { id: 'zone-terraza', name: 'Terraza', sortOrder: 2 }
];

const initialTables: TableLayout[] = [
  {
    id: 'table-t1',
    name: 'T1',
    capacity: 4,
    status: 'available',
    shape: 'round',
    zoneId: 'zone-piso-1',
    positionX: 0.08,
    positionY: 0.1,
    width: 0.16,
    height: 0.16
  },
  {
    id: 'table-t2',
    name: 'T2',
    capacity: 4,
    status: 'occupied',
    shape: 'square',
    zoneId: 'zone-piso-1',
    positionX: 0.38,
    positionY: 0.1,
    width: 0.18,
    height: 0.18
  },
  {
    id: 'table-t3',
    name: 'T3',
    capacity: 6,
    status: 'reserved',
    shape: 'round',
    zoneId: 'zone-piso-1',
    positionX: 0.68,
    positionY: 0.12,
    width: 0.2,
    height: 0.2
  },
  {
    id: 'table-t4',
    name: 'T4',
    capacity: 2,
    status: 'available',
    shape: 'square',
    zoneId: 'zone-piso-1',
    positionX: 0.12,
    positionY: 0.55,
    width: 0.13,
    height: 0.13
  },
  {
    id: 'table-t5',
    name: 'T5',
    capacity: 8,
    status: 'occupied',
    shape: 'round',
    zoneId: 'zone-piso-1',
    positionX: 0.5,
    positionY: 0.55,
    width: 0.24,
    height: 0.24
  },

  {
    id: 'table-t6',
    name: 'T6',
    capacity: 4,
    status: 'available',
    shape: 'square',
    zoneId: 'zone-piso-2',
    positionX: 0.15,
    positionY: 0.15,
    width: 0.18,
    height: 0.18
  },
  {
    id: 'table-t7',
    name: 'T7',
    capacity: 4,
    status: 'reserved',
    shape: 'round',
    zoneId: 'zone-piso-2',
    positionX: 0.45,
    positionY: 0.15,
    width: 0.16,
    height: 0.16
  },
  {
    id: 'table-t8',
    name: 'T8',
    capacity: 6,
    status: 'occupied',
    shape: 'square',
    zoneId: 'zone-piso-2',
    positionX: 0.68,
    positionY: 0.2,
    width: 0.2,
    height: 0.2
  },
  {
    id: 'table-t9',
    name: 'T9',
    capacity: 2,
    status: 'available',
    shape: 'round',
    zoneId: 'zone-piso-2',
    positionX: 0.32,
    positionY: 0.62,
    width: 0.13,
    height: 0.13
  },

  {
    id: 'table-t10',
    name: 'T10',
    capacity: 4,
    status: 'available',
    shape: 'round',
    zoneId: 'zone-terraza',
    positionX: 0.18,
    positionY: 0.2,
    width: 0.16,
    height: 0.16
  },
  {
    id: 'table-t11',
    name: 'T11',
    capacity: 8,
    status: 'reserved',
    shape: 'square',
    zoneId: 'zone-terraza',
    positionX: 0.55,
    positionY: 0.2,
    width: 0.24,
    height: 0.24
  },
  {
    id: 'table-t12',
    name: 'T12',
    capacity: 6,
    status: 'occupied',
    shape: 'round',
    zoneId: 'zone-terraza',
    positionX: 0.4,
    positionY: 0.6,
    width: 0.2,
    height: 0.2
  }
];

let zones: Zone[] = [...initialZones];
let tables: TableLayout[] = [...initialTables];

/** Reset the in-memory store back to its seed (used by tests). */
export function resetTableData(): void {
  zones = [...initialZones];
  tables = [...initialTables];
}

export async function getZones(): Promise<Zone[]> {
  // Zones are maintained in sortOrder order (seeded in order, appended in order).
  return [...zones];
}

export async function getTablesByZone(zoneId: string): Promise<TableLayout[]> {
  return tables.filter((t) => t.zoneId === zoneId);
}

export async function updateTableLayout(
  id: string,
  layout: TableLayoutUpdate
): Promise<TableLayout> {
  const table = tables.find((t) => t.id === id);
  if (!table) throw new Error(`Table not found: ${id}`);

  if (layout.positionX !== undefined) table.positionX = clamp(layout.positionX);
  if (layout.positionY !== undefined) table.positionY = clamp(layout.positionY);
  if (layout.width !== undefined) table.width = clamp(layout.width);
  if (layout.height !== undefined) table.height = clamp(layout.height);

  return { ...table };
}

export async function createTable(input: CreateTableInput): Promise<TableLayout> {
  const table: TableLayout = {
    id: uuid(),
    name: input.name,
    capacity: input.capacity,
    shape: input.shape,
    status: 'available',
    zoneId: input.zoneId,
    positionX: 0.5,
    positionY: 0.5,
    width: 0.16,
    height: 0.16
  };
  tables.push(table);
  return { ...table };
}

export async function deleteTable(id: string): Promise<void> {
  const index = tables.findIndex((t) => t.id === id);
  if (index === -1) throw new Error(`Table not found: ${id}`);
  tables.splice(index, 1);
}

export async function createZone(name: string): Promise<Zone> {
  const zone: Zone = {
    id: uuid(),
    name,
    sortOrder: zones.length
  };
  zones.push(zone);
  return { ...zone };
}
