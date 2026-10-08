import { http, HttpResponse } from 'msw';
import { schemas } from '@/api-client';
import { db } from '../db';
import { API_URL } from '../api-url';

const err = (statusCode: number, message: string | string[], error: string) =>
  HttpResponse.json({ statusCode, message, error }, { status: statusCode });

export const inventoryHandlers = [
  http.get(`${API_URL}/inventory`, () => HttpResponse.json(db.inventory)),

  // Registered before `/:id` so "low-stock" is not read as an id.
  http.get(`${API_URL}/inventory/low-stock`, () =>
    HttpResponse.json(db.inventory.filter((i) => i.quantityOnHand <= i.lowStockThreshold))
  ),

  http.get(`${API_URL}/inventory/:id`, ({ params }) => {
    const item = db.inventory.find((i) => i.id === String(params.id));
    return item ? HttpResponse.json(item) : err(404, 'inventory item not found', 'Not Found');
  }),

  http.post(`${API_URL}/inventory/:id/adjust`, async ({ params, request }) => {
    const item = db.inventory.find((i) => i.id === String(params.id));
    if (!item) return err(404, 'inventory item not found', 'Not Found');
    const parsed = schemas.zAdjustStockDto.safeParse(await request.json());
    if (!parsed.success) {
      return err(
        422,
        parsed.error.issues.map((i) => i.message),
        'Unprocessable Entity'
      );
    }
    // Backend forces a floor of zero.
    item.quantityOnHand = Math.max(0, item.quantityOnHand + parsed.data.quantityDelta);
    item.updatedAt = new Date().toISOString();
    return HttpResponse.json(item, { status: 201 });
  })
];
