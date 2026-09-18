import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rectsOverlap } from '../lib/layout';

const api = vi.hoisted(() => ({
  tablesControllerFindAll: vi.fn(),
  tablesControllerCreate: vi.fn(),
  tablesControllerRemove: vi.fn(),
  tablesControllerUpdate: vi.fn(),
  tablesControllerUpdateLayout: vi.fn(),
  zonesControllerFindAll: vi.fn(),
  zonesControllerCreate: vi.fn(),
  zonesControllerUpdate: vi.fn(),
  zonesControllerRemove: vi.fn(),
  zonesControllerGetNextTableName: vi.fn()
}));

vi.mock('@/api-client', () => api);

import {
  createTable,
  createZone,
  deleteTable,
  deleteZone,
  getNextTableName,
  getTables,
  getZones,
  updateTable,
  updateTableLayout,
  updateZone
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

  it('places a new table at a different position than an existing table in the same zone', async () => {
    api.tablesControllerCreate.mockResolvedValue({ data: { id: 't-new' }, error: undefined });
    api.tablesControllerUpdateLayout.mockResolvedValue({ data: { id: 't-new' }, error: undefined });
    api.tablesControllerFindAll.mockResolvedValue({
      data: [
        {
          id: 't1',
          zoneId: 'z1',
          positionX: 0.5,
          positionY: 0.5,
          width: 0.16,
          height: 0.16
        }
      ],
      error: undefined
    });

    await createTable({ name: 'T20', capacity: 4, shape: 'circle', zoneId: 'z1' });

    const body = api.tablesControllerUpdateLayout.mock.calls[0][0].body;
    expect(body.positionX).not.toBe(0.5);
    expect(body.positionY).not.toBe(0.5);
    expect(
      rectsOverlap(
        { positionX: body.positionX, positionY: body.positionY, width: 0.16, height: 0.16 },
        { positionX: 0.5, positionY: 0.5, width: 0.16, height: 0.16 }
      )
    ).toBe(false);
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

  it('createZone calls zonesControllerCreate with name + code', async () => {
    api.zonesControllerCreate.mockResolvedValue({
      data: { id: 'z-new', name: 'Sótano', code: '2' },
      error: undefined
    });

    const zone = await createZone({ name: 'Sótano', code: '2' });

    expect(api.zonesControllerCreate).toHaveBeenCalledWith({
      body: { name: 'Sótano', code: '2' }
    });
    expect(zone).toEqual({ id: 'z-new', name: 'Sótano', code: '2' });
  });

  it('createZone surfaces the backend duplicate-code message', async () => {
    api.zonesControllerCreate.mockResolvedValue({
      data: undefined,
      error: { message: 'Zone code "2" already exists', statusCode: 400 }
    });

    await expect(createZone({ name: 'Piso 2', code: '2' })).rejects.toThrow(
      'Zone code "2" already exists'
    );
  });

  it('updateZone calls zonesControllerUpdate with path + name', async () => {
    api.zonesControllerUpdate.mockResolvedValue({ data: { id: 'z1' }, error: undefined });

    await updateZone('z1', { name: 'Planta Baja' });

    expect(api.zonesControllerUpdate).toHaveBeenCalledWith({
      path: { id: 'z1' },
      body: { name: 'Planta Baja' }
    });
  });

  it('updateZone forwards an optional code', async () => {
    api.zonesControllerUpdate.mockResolvedValue({ data: { id: 'z1' }, error: undefined });

    await updateZone('z1', { code: 'VIP' });

    expect(api.zonesControllerUpdate).toHaveBeenCalledWith({
      path: { id: 'z1' },
      body: { code: 'VIP' }
    });
  });

  it('getNextTableName calls zonesControllerGetNextTableName and unwraps suggestedName', async () => {
    api.zonesControllerGetNextTableName.mockResolvedValue({
      data: { suggestedName: '102' },
      error: undefined
    });

    const name = await getNextTableName('z1');

    expect(api.zonesControllerGetNextTableName).toHaveBeenCalledWith({ path: { id: 'z1' } });
    expect(name).toBe('102');
  });

  it('createTable surfaces the backend duplicate-name message', async () => {
    api.tablesControllerCreate.mockResolvedValue({
      data: undefined,
      error: { message: 'Table name "101" already exists', statusCode: 400 }
    });

    await expect(
      createTable({ name: '101', capacity: 4, shape: 'circle', zoneId: 'z1' })
    ).rejects.toThrow('Table name "101" already exists');
  });

  it('deleteZone calls zonesControllerRemove with path', async () => {
    api.zonesControllerRemove.mockResolvedValue({ data: undefined, error: undefined });

    await deleteZone('z1');

    expect(api.zonesControllerRemove).toHaveBeenCalledWith({ path: { id: 'z1' } });
  });

  it('deleteZone surfaces the API rejection message', async () => {
    api.zonesControllerRemove.mockResolvedValue({
      data: undefined,
      error: {
        message: 'Cannot delete a zone that has reserved or occupied tables',
        statusCode: 400
      }
    });

    await expect(deleteZone('z1')).rejects.toThrow(
      'Cannot delete a zone that has reserved or occupied tables'
    );
  });
});
