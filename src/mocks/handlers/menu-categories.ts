import { http, HttpResponse } from 'msw';
import { schemas } from '@/api-client';
import { db, findCategory, itemsInCategory, nextSortOrder } from '../db';
import { API_URL } from '../api-url';
import type { Category } from '../types';

const err = (statusCode: number, message: string | string[], error: string) =>
  HttpResponse.json({ statusCode, message, error }, { status: statusCode });

const now = () => new Date().toISOString();

// zUpdate* schemas carry `.default()` on optional fields, which would clobber
// existing values on a partial PATCH. Keep only the keys the caller actually sent.
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

export const menuCategoriesHandlers = [
  http.get(`${API_URL}/menu/categories`, () =>
    HttpResponse.json(db.categories.toSorted((a, b) => a.sortOrder - b.sortOrder))
  ),

  http.get(`${API_URL}/menu/categories/:id`, ({ params }) => {
    const cat = findCategory(String(params.id));
    return cat ? HttpResponse.json(cat) : err(404, 'category not found', 'Not Found');
  }),

  http.post(`${API_URL}/menu/categories`, async ({ request }) => {
    const parsed = schemas.zCreateCategoryDto.safeParse(await request.json());
    if (!parsed.success) {
      return err(
        422,
        parsed.error.issues.map((i) => i.message),
        'Unprocessable Entity'
      );
    }
    const body = parsed.data;
    const cat: Category = {
      id: crypto.randomUUID(),
      name: body.name,
      sortOrder: body.sortOrder ?? nextSortOrder(),
      active: body.active ?? true,
      createdAt: now(),
      updatedAt: now()
    };
    db.categories.push(cat);
    return HttpResponse.json(cat, { status: 201 });
  }),

  http.patch(`${API_URL}/menu/categories/:id`, async ({ params, request }) => {
    const cat = findCategory(String(params.id));
    if (!cat) return err(404, 'category not found', 'Not Found');
    const raw = await request.json();
    const parsed = schemas.zUpdateCategoryDto.safeParse(raw);
    if (!parsed.success) {
      return err(
        422,
        parsed.error.issues.map((i) => i.message),
        'Unprocessable Entity'
      );
    }
    Object.assign(cat, pick<Category>(raw, ['name', 'sortOrder', 'active']), {
      updatedAt: now()
    });
    return HttpResponse.json(cat);
  }),

  http.delete(`${API_URL}/menu/categories/:id`, ({ params }) => {
    const id = String(params.id);
    const cat = findCategory(id);
    if (!cat) return err(404, 'category not found', 'Not Found');
    if (itemsInCategory(id).length > 0) {
      return err(409, 'category has menu items', 'Conflict');
    }
    db.categories = db.categories.filter((c) => c.id !== id);
    return HttpResponse.json(cat);
  })
];
