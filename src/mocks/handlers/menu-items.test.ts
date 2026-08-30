import { describe, expect, it } from 'vitest';
import { db } from '../db';

const BASE = 'http://localhost:3000/api';
const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';

describe('menu-items handlers', () => {
  it('GET /menu/items returns a paginated envelope', async () => {
    const res = await fetch(`${BASE}/menu/items`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.meta.total).toBeGreaterThanOrEqual(body.data.length);
  });

  it('GET /menu/items?categoryId filters', async () => {
    const cid = db.categories[0].id;
    const { data } = await (await fetch(`${BASE}/menu/items?categoryId=${cid}`)).json();
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((i: { categoryId: string }) => i.categoryId === cid)).toBe(true);
  });

  it('GET /menu/items?page=2&limit=2 slices', async () => {
    const all = (await (await fetch(`${BASE}/menu/items?limit=100`)).json()).data;
    const p2 = await (await fetch(`${BASE}/menu/items?page=2&limit=2`)).json();
    expect(p2.data).toEqual(all.slice(2, 4));
    expect(p2.meta.page).toBe(2);
  });

  it('POST /menu/items with a malformed body returns 422', async () => {
    const res = await fetch(`${BASE}/menu/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'x' })
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.statusCode).toBe(422);
    expect(Array.isArray(body.message)).toBe(true);
  });

  it('POST /menu/items with an unknown categoryId returns 400', async () => {
    const res = await fetch(`${BASE}/menu/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Nachos', priceCents: 900, categoryId: UNKNOWN_UUID })
    });
    expect(res.status).toBe(400);
  });

  it('POST then GET /menu/items/:id round-trips', async () => {
    const created = await (
      await fetch(`${BASE}/menu/items`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Nachos',
          priceCents: 900,
          categoryId: db.categories[0].id
        })
      })
    ).json();
    expect(created.id).toBeTruthy();
    const fetched = await (await fetch(`${BASE}/menu/items/${created.id}`)).json();
    expect(fetched.name).toBe('Nachos');
  });
});
