import { http, HttpResponse } from 'msw';
import { schemas } from '@/api-client';
import { db, findCategory, findItem } from '../db';
import type { MenuItem } from '../types';

const err = (statusCode: number, message: string | string[], error: string) =>
  HttpResponse.json({ statusCode, message, error }, { status: statusCode });

const now = () => new Date().toISOString();

// zUpdateMenuItemDto carries `.default()` on optional fields; only apply what was sent.
function pick<T extends object>(raw: unknown, allowed: readonly (keyof T)[]): Partial<T> {
  if (typeof raw !== 'object' || raw === null) return {};
  const out: Partial<T> = {};
  for (const key of allowed) {
    if (key in (raw as Record<string, unknown>)) {
      out[key] = (raw as Record<string, unknown>)[key as string] as T[keyof T];
    }
  }
  return out;
}

const ITEM_KEYS = [
  'name',
  'description',
  'priceCents',
  'currency',
  'imageUrl',
  'available',
  'categoryId'
] as const;

export const menuItemsHandlers = [
  http.get('*/menu/items', ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const available = url.searchParams.get('available');
    let items = [...db.items];
    if (categoryId) items = items.filter((i) => i.categoryId === categoryId);
    if (available != null) items = items.filter((i) => i.available === (available === 'true'));
    return HttpResponse.json(items);
  }),

  http.get('*/menu/items/:id', ({ params }) => {
    const item = findItem(String(params.id));
    return item ? HttpResponse.json(item) : err(404, 'menu item not found', 'Not Found');
  }),

  http.post('*/menu/items', async ({ request }) => {
    const parsed = schemas.zCreateMenuItemDto.safeParse(await request.json());
    if (!parsed.success) {
      return err(
        422,
        parsed.error.issues.map((i) => i.message),
        'Unprocessable Entity'
      );
    }
    const body = parsed.data;
    if (!findCategory(body.categoryId)) {
      return err(400, 'category not found', 'Bad Request');
    }
    const item: MenuItem = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description ?? '',
      priceCents: body.priceCents,
      currency: body.currency ?? 'USD',
      imageUrl: body.imageUrl ?? '',
      available: body.available ?? true,
      categoryId: body.categoryId,
      createdAt: now(),
      updatedAt: now()
    };
    db.items.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.patch('*/menu/items/:id', async ({ params, request }) => {
    const item = findItem(String(params.id));
    if (!item) return err(404, 'menu item not found', 'Not Found');
    const raw = await request.json();
    const parsed = schemas.zUpdateMenuItemDto.safeParse(raw);
    if (!parsed.success) {
      return err(
        422,
        parsed.error.issues.map((i) => i.message),
        'Unprocessable Entity'
      );
    }
    const patch = pick<MenuItem>(raw, ITEM_KEYS);
    if (patch.categoryId && !findCategory(patch.categoryId)) {
      return err(400, 'category not found', 'Bad Request');
    }
    Object.assign(item, patch, { updatedAt: now() });
    return HttpResponse.json(item);
  }),

  http.delete('*/menu/items/:id', ({ params }) => {
    const id = String(params.id);
    const item = findItem(id);
    if (!item) return err(404, 'menu item not found', 'Not Found');
    db.items = db.items.filter((i) => i.id !== id);
    return HttpResponse.json(item);
  })
];
