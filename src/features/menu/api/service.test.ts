import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDb } from '@/mocks/db';
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getCategories,
  getMenuItemById,
  getMenuItems,
  updateMenuItem
} from './service';

beforeEach(() => resetDb());

describe('menu item service', () => {
  it('lists seeded items', async () => {
    const { items, total } = await getMenuItems();
    expect(items.length).toBeGreaterThan(0);
    expect(total).toBeGreaterThanOrEqual(items.length);
  });

  it('filters by categoryId', async () => {
    const cid = db.categories[0].id;
    const { items } = await getMenuItems({ categoryId: cid });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.categoryId === cid)).toBe(true);
  });

  it('filters by availability', async () => {
    const { items } = await getMenuItems({ available: true });
    expect(items.every((i) => i.available)).toBe(true);
  });

  it('creates an item and reads it back', async () => {
    const created = await createMenuItem({
      name: 'Test Wings',
      priceCents: 1200,
      categoryId: db.categories[0].id
    });
    expect(created.id).toBeTruthy();
    expect(await getMenuItemById(created.id)).toMatchObject({ name: 'Test Wings' });
  });

  it('rejects an item with an unknown category', async () => {
    await expect(
      createMenuItem({
        name: 'Bad',
        priceCents: 100,
        categoryId: '00000000-0000-4000-8000-000000000000'
      })
    ).rejects.toThrow();
  });

  it('updates an item', async () => {
    const {
      items: [first]
    } = await getMenuItems();
    const updated = await updateMenuItem(first.id, { priceCents: 4242 });
    expect(updated.priceCents).toBe(4242);
  });

  it('deletes an item', async () => {
    const {
      items: [first]
    } = await getMenuItems();
    await deleteMenuItem(first.id);
    await expect(getMenuItemById(first.id)).rejects.toThrow();
  });

  it('getMenuItemById throws on unknown id', async () => {
    await expect(getMenuItemById('nope')).rejects.toThrow();
  });
});

describe('category service', () => {
  it('lists seeded categories', async () => {
    expect((await getCategories()).length).toBeGreaterThanOrEqual(3);
  });

  it('creates a category', async () => {
    const created = await createCategory({ name: 'Specials' });
    expect(created.id).toBeTruthy();
  });

  it('deletes an empty category', async () => {
    const created = await createCategory({ name: 'Temp' });
    await expect(deleteCategory(created.id)).resolves.toBeUndefined();
  });

  it('refuses to delete a category that still has items', async () => {
    const withItems = db.items[0].categoryId;
    await expect(deleteCategory(withItems)).rejects.toThrow();
  });
});
