import { faker } from '@faker-js/faker';
import type { Category, MenuItem } from './types';

// Deterministic so tests and dev see the same data every boot.
const SEED = 20260828;

const CATEGORY_NAMES = ['Appetizers', 'Mains', 'Desserts', 'Drinks'];

export function makeSeedData(): { categories: Category[]; items: MenuItem[] } {
  faker.seed(SEED);
  const now = new Date('2026-08-01T12:00:00.000Z').toISOString();

  // Contract types `categoryId` as a UUID, so seed ids must be real UUIDs.
  // Faker is seeded above, so these are stable across boots.
  const categories: Category[] = CATEGORY_NAMES.map((name, i) => ({
    id: faker.string.uuid(),
    name,
    sortOrder: i + 1,
    active: true,
    createdAt: now,
    updatedAt: now
  }));

  const items: MenuItem[] = [];
  for (const cat of categories) {
    const perCat = faker.number.int({ min: 3, max: 4 });
    for (let i = 0; i < perCat; i++) {
      items.push({
        id: faker.string.uuid(),
        name: faker.food.dish(),
        description: faker.food.description(),
        priceCents: faker.number.int({ min: 500, max: 3500 }),
        currency: 'USD',
        imageUrl: '',
        available: faker.datatype.boolean({ probability: 0.85 }),
        categoryId: cat.id,
        createdAt: now,
        updatedAt: now
      });
    }
  }

  return { categories, items };
}
