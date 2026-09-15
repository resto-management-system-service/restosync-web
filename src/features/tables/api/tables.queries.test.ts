import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { Table, Zone } from './types';

vi.mock('./service', () => ({
  getTables: vi.fn(),
  getZones: vi.fn(),
  createTable: vi.fn(),
  updateTableLayout: vi.fn(),
  deleteTable: vi.fn(),
  createZone: vi.fn()
}));

import { getTables, getZones } from './service';
import { tablesQueryOptions, zonesQueryOptions } from './tables.queries';

const table = (id: string, name: string): Table => ({
  id,
  name,
  capacity: 4,
  status: 'AVAILABLE',
  restaurantId: 'r1',
  zoneId: 'z1',
  positionX: 0.2,
  positionY: 0.2,
  width: 0.16,
  height: 0.16,
  shape: 'circle',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

const zone = (id: string, name: string): Zone => ({
  id,
  restaurantId: 'r1',
  name,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

describe('tables query options', () => {
  it('builds stable query keys', () => {
    expect(tablesQueryOptions().queryKey).toEqual(['tables', 'list']);
    expect(zonesQueryOptions().queryKey).toEqual(['tables', 'zones']);
  });

  it('fetches tables through the service', async () => {
    vi.mocked(getTables).mockResolvedValue([table('t1', 'T1')]);

    const client = new QueryClient();
    const data = await client.fetchQuery(tablesQueryOptions());

    expect(data).toEqual([table('t1', 'T1')]);
    expect(getTables).toHaveBeenCalledTimes(1);
  });

  it('fetches zones through the service', async () => {
    vi.mocked(getZones).mockResolvedValue([zone('z1', 'Piso 1')]);

    const client = new QueryClient();
    const data = await client.fetchQuery(zonesQueryOptions());

    expect(data).toEqual([zone('z1', 'Piso 1')]);
    expect(getZones).toHaveBeenCalledTimes(1);
  });
});
