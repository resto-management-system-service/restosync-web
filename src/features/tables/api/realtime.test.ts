import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import type { Table } from './types';
import { applyTableStatusChange } from './realtime';

const table = (
  id: string,
  name: string,
  zoneId: string | null,
  status: Table['status'] = 'AVAILABLE'
): Table => ({
  id,
  name,
  capacity: 4,
  status,
  restaurantId: 'r1',
  zoneId,
  positionX: 0.2,
  positionY: 0.2,
  width: 0.16,
  height: 0.16,
  shape: 'circle',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

describe('applyTableStatusChange', () => {
  it('updates the matching table status in the cache without a refetch', () => {
    const client = new QueryClient();
    client.setQueryData(['tables', 'list'], [table('t1', 'T1', 'z1'), table('t2', 'T2', 'z1')]);

    applyTableStatusChange(client, {
      tableId: 't1',
      restaurantId: 'r1',
      status: 'OCCUPIED',
      zoneId: 'z1'
    });

    const cached = client.getQueryData<Table[]>(['tables', 'list']);
    expect(cached?.find((t) => t.id === 't1')?.status).toBe('OCCUPIED');
    // Other tables are untouched; other fields on the updated table preserved.
    expect(cached?.find((t) => t.id === 't2')?.status).toBe('AVAILABLE');
    expect(cached?.find((t) => t.id === 't1')?.name).toBe('T1');
  });

  it('applies the update for a table in a zone other than the active one', () => {
    const client = new QueryClient();
    // The user is currently viewing z1; t6 lives in z2. The whole-list patch
    // must still apply so z2 is correct when its tab is opened later.
    client.setQueryData(['tables', 'list'], [table('t1', 'T1', 'z1'), table('t6', 'T6', 'z2')]);

    applyTableStatusChange(client, {
      tableId: 't6',
      restaurantId: 'r1',
      status: 'RESERVED',
      zoneId: 'z2'
    });

    const cached = client.getQueryData<Table[]>(['tables', 'list']);
    expect(cached?.find((t) => t.id === 't6')?.status).toBe('RESERVED');
    expect(cached?.find((t) => t.id === 't1')?.status).toBe('AVAILABLE');
  });

  it('leaves the cache untouched for an unknown tableId', () => {
    const client = new QueryClient();
    client.setQueryData(['tables', 'list'], [table('t1', 'T1', 'z1')]);

    applyTableStatusChange(client, {
      tableId: 'does-not-exist',
      restaurantId: 'r1',
      status: 'RESERVED',
      zoneId: 'z1'
    });

    const cached = client.getQueryData<Table[]>(['tables', 'list']);
    expect(cached?.[0].status).toBe('AVAILABLE');
  });
});
