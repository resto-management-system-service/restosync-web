// ============================================================
// Tables Service — Data Access Layer using the Generated API Client
// ============================================================
import {
  tablesControllerCreate,
  tablesControllerFindAll,
  tablesControllerRemove,
  tablesControllerUpdate,
  tablesControllerUpdateLayout,
  zonesControllerCreate,
  zonesControllerFindAll,
  zonesControllerRemove,
  zonesControllerUpdate,
  type UpdateTableLayoutDto
} from '@/api-client';
import type { CreateTableInput, Table, UpdateTableInput, UpdateZoneInput, Zone } from './types';

/** Default placement (percentages, canvas center) for a newly created table. */
const DEFAULT_LAYOUT: UpdateTableLayoutDto = {
  positionX: 0.5,
  positionY: 0.5,
  width: 0.16,
  height: 0.16
};

/**
 * Extract a human-readable message from a generated-client error. NestJS error
 * bodies are `{ message, error, statusCode }`; `message` may be a string or an
 * array of strings (validation errors).
 */
function extractApiMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  }
  return fallback;
}

/**
 * Fetch all tables for the current restaurant. Zone filtering happens
 * client-side, since the API's list endpoint has no zone query parameter.
 */
export async function getTables(): Promise<Table[]> {
  const { data, error } = await tablesControllerFindAll();

  if (error) {
    throw new Error(`Failed to fetch tables: ${JSON.stringify(error)}`);
  }

  return (data as Table[]) ?? [];
}

/**
 * Fetch all zones for the current restaurant, ordered by sortOrder.
 */
export async function getZones(): Promise<Zone[]> {
  const { data, error } = await zonesControllerFindAll();

  if (error) {
    throw new Error(`Failed to fetch zones: ${JSON.stringify(error)}`);
  }

  return (data as Zone[]) ?? [];
}

/**
 * Persist layout-only fields (zone, position, size, shape) via
 * PATCH /tables/:id/layout.
 */
export async function updateTableLayout(id: string, layout: UpdateTableLayoutDto): Promise<Table> {
  const { data, error } = await tablesControllerUpdateLayout({ path: { id }, body: layout });

  if (error) {
    throw new Error(`Failed to update table layout: ${JSON.stringify(error)}`);
  }

  return data as Table;
}

/**
 * Create a table and place it in a zone. POST /tables only accepts
 * `{ name, capacity }`; shape + zone + position are set via the layout
 * endpoint, so this performs both calls.
 */
export async function createTable(input: CreateTableInput): Promise<Table> {
  const { data, error } = await tablesControllerCreate({
    body: { name: input.name, capacity: input.capacity }
  });

  if (error) {
    throw new Error(`Failed to create table: ${JSON.stringify(error)}`);
  }

  const created = data as Table;
  return updateTableLayout(created.id, {
    zoneId: input.zoneId,
    shape: input.shape,
    ...DEFAULT_LAYOUT
  });
}

/**
 * Delete a table by ID (only allowed for AVAILABLE tables server-side).
 */
export async function deleteTable(id: string): Promise<void> {
  const { error } = await tablesControllerRemove({ path: { id } });

  if (error) {
    throw new Error(`Failed to delete table: ${JSON.stringify(error)}`);
  }
}

/**
 * Update a table's name/capacity via PATCH /tables/:id.
 */
export async function updateTable(id: string, input: UpdateTableInput): Promise<Table> {
  const { data, error } = await tablesControllerUpdate({
    path: { id },
    body: { name: input.name, capacity: input.capacity }
  });

  if (error) {
    throw new Error(`Failed to update table: ${JSON.stringify(error)}`);
  }

  return data as Table;
}

/**
 * Create a new zone for the current restaurant.
 */
export async function createZone(name: string): Promise<Zone> {
  const { data, error } = await zonesControllerCreate({ body: { name } });

  if (error) {
    throw new Error(`Failed to create zone: ${JSON.stringify(error)}`);
  }

  return data as Zone;
}

/**
 * Rename a zone via PATCH /zones/:id.
 */
export async function updateZone(id: string, input: UpdateZoneInput): Promise<Zone> {
  const { data, error } = await zonesControllerUpdate({
    path: { id },
    body: { name: input.name }
  });

  if (error) {
    throw new Error(`Failed to update zone: ${JSON.stringify(error)}`);
  }

  return data as Zone;
}

/**
 * Delete a zone via DELETE /zones/:id. The API rejects (400) when the zone
 * still has RESERVED/OCCUPIED tables; the thrown error carries that message.
 */
export async function deleteZone(id: string): Promise<void> {
  const { error } = await zonesControllerRemove({ path: { id } });

  if (error) {
    throw new Error(extractApiMessage(error, 'Failed to delete zone'));
  }
}
