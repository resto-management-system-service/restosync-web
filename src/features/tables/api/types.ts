import type {
  CreateTableDto,
  UpdateTableDto,
  UpdateTableLayoutDto,
  CreateZoneDto,
  UpdateZoneDto
} from '@/api-client';

// ============================================================
// Types for the Tables Feature
// ============================================================
// Request DTOs come from the generated OpenAPI client. Response shapes are
// typed `unknown` by the client (the API controllers don't declare response
// schemas), so `Table`/`Zone` below mirror the Prisma models the API returns.

// Re-export the request DTOs from the generated client.
export type { CreateTableDto, UpdateTableDto, UpdateTableLayoutDto, CreateZoneDto, UpdateZoneDto };

export type TableShape = 'rounded' | 'square' | 'circle';
export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED';

export interface Table {
  id: string;
  name: string;
  capacity: number | null;
  status: TableStatus;
  restaurantId: string;
  zoneId: string | null;
  /** Percentage of canvas width (0.0–1.0). Null until the table is placed. */
  positionX: number | null;
  /** Percentage of canvas height (0.0–1.0). Null until the table is placed. */
  positionY: number | null;
  /** Percentage of canvas width (0.0–1.0). Null until the table is placed. */
  width: number | null;
  /** Percentage of canvas height (0.0–1.0). Null until the table is placed. */
  height: number | null;
  shape: TableShape | null;
  createdAt: string;
  updatedAt: string;
  activeOrder?: { id: string; number: string; totalCents: number } | null;
}

export interface Zone {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Input required to create a table and place it in a zone. */
export interface CreateTableInput {
  name: string;
  capacity: number;
  shape: TableShape;
  zoneId: string;
}

/** Fields editable via PATCH /tables/:id (name + capacity only; shape is layout-only). */
export interface UpdateTableInput {
  name: string;
  capacity: number;
}

/** Fields editable via PATCH /zones/:id (name only in this UI). */
export interface UpdateZoneInput {
  name: string;
}
