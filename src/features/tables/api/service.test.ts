import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  tablesControllerFindAll: vi.fn(),
  tablesControllerCreate: vi.fn(),
  tablesControllerRemove: vi.fn(),
  tablesControllerUpdate: vi.fn(),
  tablesControllerUpdateLayout: vi.fn(),
  zonesControllerFindAll: vi.fn(),
  zonesControllerCreate: vi.fn()
}));

vi.mock('@/api-client', () => api);

import {
  createTable,
  createZone,
  deleteTable,
  getTables,
  getZones,
  updateTable,
  updateTableLayout
} from './service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tables service', () => {
  it('getTables calls tablesControllerFindAll and unwraps data', async () => {
    api.tablesControllerFindAll.mockResolvedValue({
      data: [{ id: 't1', name: 'T1' }],
      error: undefined
    });

    const tables = await getTables();

    expect(api.tablesControllerFindAll).toHaveBeenCalledTimes(1);
    expect(tables).toEqual([{ id: 't1', name: 'T1' }]);
  });

  it('getTables throws on API error', async () => {
    api.tablesControllerFindAll.mockResolvedValue({ data: undefined, error: { status: 500 } });

    await expect(getTables()).rejects.toThrow(/Failed to fetch tables/);
  });

  it('getZones calls zonesControllerFindAll', async () => {
    api.zonesControllerFindAll.mockResolvedValue({
      data: [{ id: 'z1', name: 'Piso 1' }],
      error: undefined
    });

    const zones = await getZones();

    expect(api.zonesControllerFindAll).toHaveBeenCalledTimes(1);
    expect(zones).toEqual([{ id: 'z1', name: 'Piso 1' }]);
  });

  it('updateTableLayout calls tablesControllerUpdateLayout with path + body', async () => {
    api.tablesControllerUpdateLayout.mockResolvedValue({ data: { id: 't1' }, error: undefined });

    await updateTableLayout('t1', { positionX: 0.5, positionY: 0.5 });

    expect(api.tablesControllerUpdateLayout).toHaveBeenCalledWith({
      path: { id: 't1' },
      body: { positionX: 0.5, positionY: 0.5 }
    });
  });

  it('createTable POSTs name/capacity then PATCHes layout with zone + shape', async () => {
    api.tablesControllerCreate.mockResolvedValue({ data: { id: 't-new' }, error: undefined });
    api.tablesControllerUpdateLayout.mockResolvedValue({ data: { id: 't-new' }, error: undefined });

    await createTable({ name: 'T20', capacity: 4, shape: 'circle', zoneId: 'z1' });

    expect(api.tablesControllerCreate).toHaveBeenCalledWith({
      body: { name: 'T20', capacity: 4 }
    });
    expect(api.tablesControllerUpdateLayout).toHaveBeenCalledWith({
      path: { id: 't-new' },
      body: {
        zoneId: 'z1',
        shape: 'circle',
        positionX: 0.5,
        positionY: 0.5,
        width: 0.16,
        height: 0.16
      }
    });
  });

  it('deleteTable calls tablesControllerRemove with path', async () => {
    api.tablesControllerRemove.mockResolvedValue({ data: undefined, error: undefined });

    await deleteTable('t1');

    expect(api.tablesControllerRemove).toHaveBeenCalledWith({ path: { id: 't1' } });
  });

  it('updateTable calls tablesControllerUpdate with path + name/capacity body', async () => {
    api.tablesControllerUpdate.mockResolvedValue({ data: { id: 't1' }, error: undefined });

    await updateTable('t1', { name: 'T1-A', capacity: 8 });

    expect(api.tablesControllerUpdate).toHaveBeenCalledWith({
      path: { id: 't1' },
      body: { name: 'T1-A', capacity: 8 }
    });
  });

  it('createZone calls zonesControllerCreate with name', async () => {
    api.zonesControllerCreate.mockResolvedValue({
      data: { id: 'z-new', name: 'Sótano' },
      error: undefined
    });

    const zone = await createZone('Sótano');

    expect(api.zonesControllerCreate).toHaveBeenCalledWith({ body: { name: 'Sótano' } });
    expect(zone).toEqual({ id: 'z-new', name: 'Sótano' });
  });
});
