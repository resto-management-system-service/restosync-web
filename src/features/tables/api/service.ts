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
  zonesControllerGetNextTableName,
  zonesControllerRemove,
  zonesControllerUpdate,
  type CreateZoneDto,
  type UpdateTableLayoutDto,
  type UpdateZoneDto
} from '@/api-client';
import { computeDefaultPlacement, computeSquareSize } from '../lib/layout';
import type {
  CreateTableInput,
  CreateZoneInput,
  Table,
  UpdateTableInput,
  UpdateZoneInput,
  Zone
} from './types';

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
 * endpoint, so this performs both calls. The default position is computed to
 * avoid overlapping tables already placed in the same zone.
 */
export async function createTable(input: CreateTableInput): Promise<Table> {
  const { data, error } = await tablesControllerCreate({
    body: { name: input.name, capacity: input.capacity }
  });

  if (error) {
    throw new Error(extractApiMessage(error, 'Failed to create table'));
  }

  const created = data as Table;

  // Compute an initially-square default size from the canvas aspect ratio so a
  // "square"/"circle" table renders square in pixels on non-square canvases.
  const size = computeSquareSize(input.canvasSize);

  // Pick a non-overlapping default spot based on what's already in the zone.
  let placement = { positionX: 0.5, positionY: 0.5 };
  try {
    const all = await getTables();
    const placedInZone = all
      .filter(
        (t) =>
          t.zoneId === input.zoneId &&
          t.positionX !== null &&
          t.positionY !== null &&
          t.width !== null &&
          t.height !== null
      )
      .map((t) => ({
        positionX: t.positionX as number,
        positionY: t.positionY as number,
        width: t.width as number,
        height: t.height as number
      }));
    placement = computeDefaultPlacement(placedInZone, size);
  } catch {
    // Fall back to the center default if existing tables can't be read.
  }

  return updateTableLayout(created.id, {
    zoneId: input.zoneId,
    shape: input.shape,
    width: size.width,
    height: size.height,
    ...placement
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
    throw new Error(extractApiMessage(error, 'Failed to update table'));
  }

  return data as Table;
}

/**
 * Suggest the next available table name for a zone (gap-reusing, e.g. zone
 * code "1" with "101"/"103" existing suggests "102"). GET /zones/:id/next-table-name.
 */
export async function getNextTableName(zoneId: string): Promise<string> {
  const { data, error } = await zonesControllerGetNextTableName({ path: { id: zoneId } });

  if (error) {
    throw new Error(extractApiMessage(error, 'Failed to suggest table name'));
  }

  return (data as { suggestedName?: string } | undefined)?.suggestedName ?? '';
}

/**
 * Create a new zone for the current restaurant.
 */
export async function createZone(input: CreateZoneInput): Promise<Zone> {
  const body: CreateZoneDto = { name: input.name, code: input.code };
  const { data, error } = await zonesControllerCreate({ body });

  if (error) {
    throw new Error(extractApiMessage(error, 'Failed to create zone'));
  }

  return data as Zone;
}

/**
 * Rename/recode a zone via PATCH /zones/:id.
 */
export async function updateZone(id: string, input: UpdateZoneInput): Promise<Zone> {
  const body: UpdateZoneDto = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.code !== undefined) body.code = input.code;

  const { data, error } = await zonesControllerUpdate({ path: { id }, body });

  if (error) {
    throw new Error(extractApiMessage(error, 'Failed to update zone'));
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
