import { beforeEach, describe, expect, it } from 'vitest';
import {
  createTable,
  createZone,
  deleteTable,
  getTablesByZone,
  getZones,
  resetTableData,
  updateTableLayout
} from './mock-data';

beforeEach(() => resetTableData());

describe('tables mock data', () => {
  it('lists zones sorted by sortOrder', async () => {
    const zones = await getZones();
    expect(zones.map((z) => z.name)).toEqual(['Piso 1', 'Piso 2', 'Terraza']);
  });

  it('returns only tables for the active zone', async () => {
    const piso1 = await getTablesByZone('zone-piso-1');
    const piso2 = await getTablesByZone('zone-piso-2');

    expect(piso1.length).toBeGreaterThan(0);
    expect(piso1.every((t) => t.zoneId === 'zone-piso-1')).toBe(true);
    expect(piso2.every((t) => t.zoneId === 'zone-piso-2')).toBe(true);
  });

  it('clamps layout updates to the 0-1 percentage range', async () => {
    const [first] = await getTablesByZone('zone-piso-1');
    const updated = await updateTableLayout(first.id, { positionX: 1.5, positionY: -0.5 });
    expect(updated.positionX).toBe(1);
    expect(updated.positionY).toBe(0);
  });

  it('creates and deletes a table', async () => {
    const created = await createTable({
      name: 'T20',
      capacity: 4,
      shape: 'round',
      zoneId: 'zone-piso-2'
    });
    expect((await getTablesByZone('zone-piso-2')).some((t) => t.id === created.id)).toBe(true);

    await deleteTable(created.id);
    expect((await getTablesByZone('zone-piso-2')).some((t) => t.id === created.id)).toBe(false);
  });

  it('creates a zone', async () => {
    const zone = await createZone('Sótano');
    expect(zone.name).toBe('Sótano');
    expect((await getZones()).some((z) => z.id === zone.id)).toBe(true);
  });
});
