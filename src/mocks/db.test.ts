import { describe, expect, it } from 'vitest';
import { db, findCategory, itemsInCategory, nextSortOrder, resetDb } from './db';

describe('mock db', () => {
  it('seeds categories and items', () => {
    resetDb();
    expect(db.categories.length).toBeGreaterThanOrEqual(3);
    expect(db.items.length).toBeGreaterThanOrEqual(6);
  });

  it('every item references a real category', () => {
    resetDb();
    for (const item of db.items) {
      expect(findCategory(item.categoryId)).toBeDefined();
    }
  });

  it('resetDb restores the original seed', () => {
    resetDb();
    const count = db.items.length;
    db.items.push({ ...db.items[0], id: 'extra' });
    resetDb();
    expect(db.items.length).toBe(count);
  });

  it('nextSortOrder returns max + 1', () => {
    resetDb();
    const max = Math.max(...db.categories.map((c) => c.sortOrder));
    expect(nextSortOrder()).toBe(max + 1);
  });

  it('itemsInCategory filters by categoryId', () => {
    resetDb();
    const cat = db.categories[0];
    const items = itemsInCategory(cat.id);
    expect(items.every((i) => i.categoryId === cat.id)).toBe(true);
  });
});
