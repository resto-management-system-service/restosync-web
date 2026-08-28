import { makeSeedData } from './seed';
import type { Category, MenuItem } from './types';

export const db: { categories: Category[]; items: MenuItem[] } = {
  categories: [],
  items: []
};

export function resetDb(): void {
  const seed = makeSeedData();
  db.categories = seed.categories;
  db.items = seed.items;
}

// Seed on first import.
resetDb();

export function findCategory(id: string): Category | undefined {
  return db.categories.find((c) => c.id === id);
}

export function findItem(id: string): MenuItem | undefined {
  return db.items.find((i) => i.id === id);
}

export function itemsInCategory(id: string): MenuItem[] {
  return db.items.filter((i) => i.categoryId === id);
}

export function nextSortOrder(): number {
  if (db.categories.length === 0) return 1;
  return Math.max(...db.categories.map((c) => c.sortOrder)) + 1;
}
