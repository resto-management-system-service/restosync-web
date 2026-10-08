import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb } from '@/mocks/db';
import { adjustStock, getInventory, getLowStock } from './service';

beforeEach(() => resetDb());

describe('inventory service', () => {
  it('lists seeded stock', async () => {
    const items = await getInventory();
    expect(items.length).toBe(db.inventory.length);
    expect(typeof items[0].quantityOnHand).toBe('number');
  });

  it('returns only items at or below their threshold as low stock', async () => {
    const low = await getLowStock();
    expect(low.length).toBeGreaterThan(0);
    expect(low.every((i) => i.quantityOnHand <= i.lowStockThreshold)).toBe(true);
  });

  it('applies a restock and clears the low-stock flag', async () => {
    const [target] = await getLowStock();
    await adjustStock(target.id, {
      type: 'RESTOCK',
      quantityDelta: target.lowStockThreshold + 5,
      reason: 'delivery'
    });
    expect((await getLowStock()).some((i) => i.id === target.id)).toBe(false);
  });

  it('never drops stock below zero', async () => {
    const [item] = await getInventory();
    await adjustStock(item.id, {
      type: 'WASTE',
      quantityDelta: -10_000,
      reason: 'spill'
    });
    expect(db.inventory.find((i) => i.id === item.id)?.quantityOnHand).toBe(0);
  });

  it('rejects an adjustment for an unknown item', async () => {
    await expect(
      adjustStock('00000000-0000-4000-8000-000000000000', {
        type: 'RESTOCK',
        quantityDelta: 1,
        reason: 'x'
      })
    ).rejects.toThrow();
  });
});
