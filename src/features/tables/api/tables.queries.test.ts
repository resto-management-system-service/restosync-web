import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { getQueryClient } from '@/lib/query-client';
import type { Table, Zone } from './types';

vi.mock('./service', () => ({
  getTables: vi.fn(),
  getZones: vi.fn(),
  getNextTableName: vi.fn(),
  createTable: vi.fn(),
  updateTableLayout: vi.fn(),
  deleteTable: vi.fn(),
  createZone: vi.fn()
}));

import { getNextTableName, getTables, getZones } from './service';
import {
  nextTableNameQueryOptions,
  tablesQueryOptions,
  updateTableLayoutMutation,
  zonesQueryOptions
} from './tables.queries';

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
  code: '1',
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

describe('tables query options', () => {
  it('builds stable query keys', () => {
    expect(tablesQueryOptions().queryKey).toEqual(['tables', 'list']);
    expect(zonesQueryOptions().queryKey).toEqual(['tables', 'zones']);
  });

  it('builds a per-zone next-table-name key', () => {
    expect(nextTableNameQueryOptions('z1').queryKey).toEqual(['tables', 'next-table-name', 'z1']);
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

  it('fetches the next table name through the service', async () => {
    vi.mocked(getNextTableName).mockResolvedValue('102');

    const client = new QueryClient();
    const data = await client.fetchQuery(nextTableNameQueryOptions('z1'));

    expect(data).toBe('102');
    expect(getNextTableName).toHaveBeenCalledWith('z1');
  });
});

describe('updateTableLayoutMutation optimistic update', () => {
  it('applies the new layout to the tables cache synchronously (no stale gap after resize)', async () => {
    const client = getQueryClient();
    client.setQueryData(['tables', 'list'], [table('t1', 'T1')]);

    await updateTableLayoutMutation.onMutate?.(
      {
        id: 't1',
        layout: { width: 0.4, height: 0.4, positionX: 0.3, positionY: 0.3 }
      },
      { client, meta: undefined }
    );

    const cached = client.getQueryData<Table[]>(['tables', 'list']);
    expect(cached?.[0].width).toBe(0.4);
    expect(cached?.[0].height).toBe(0.4);
    expect(cached?.[0].positionX).toBe(0.3);
    expect(cached?.[0].positionY).toBe(0.3);
    // Fields not part of the layout update are preserved.
    expect(cached?.[0].name).toBe('T1');
    expect(cached?.[0].shape).toBe('circle');

    client.removeQueries({ queryKey: ['tables', 'list'] });
  });

  it('leaves other tables untouched when updating a single table', async () => {
    const client = getQueryClient();
    client.setQueryData(['tables', 'list'], [table('t1', 'T1'), table('t2', 'T2')]);

    await updateTableLayoutMutation.onMutate?.(
      {
        id: 't1',
        layout: { width: 0.4, height: 0.4 }
      },
      { client, meta: undefined }
    );

    const cached = client.getQueryData<Table[]>(['tables', 'list']);
    expect(cached?.[0].width).toBe(0.4);
    expect(cached?.[1].width).toBe(0.16);
    expect(cached?.[1].name).toBe('T2');

    client.removeQueries({ queryKey: ['tables', 'list'] });
  });
});
