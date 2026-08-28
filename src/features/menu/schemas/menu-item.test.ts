import { describe, expect, it } from 'vitest';
import type { MenuItem } from '../api/types';
import { menuItemFormSchema, menuItemToFormValues, toCreateMenuItemDto } from './menu-item';

describe('menuItemFormSchema', () => {
  it('rejects a short name and non-positive price', () => {
    const res = menuItemFormSchema.safeParse({
      name: 'a',
      description: '',
      priceDollars: 0,
      currency: 'USD',
      imageUrl: '',
      available: true,
      categoryId: ''
    });
    expect(res.success).toBe(false);
  });

  it('accepts a valid form', () => {
    const res = menuItemFormSchema.safeParse({
      name: 'Fries',
      description: 'Crispy',
      priceDollars: 4.5,
      currency: 'USD',
      imageUrl: '',
      available: true,
      categoryId: 'cat-1'
    });
    expect(res.success).toBe(true);
  });
});

describe('toCreateMenuItemDto', () => {
  it('converts dollars to integer cents and drops empty strings', () => {
    const dto = toCreateMenuItemDto({
      name: 'Fries',
      description: '',
      priceDollars: 4.5,
      currency: 'USD',
      imageUrl: '',
      available: true,
      categoryId: 'cat-1'
    });
    expect(dto.priceCents).toBe(450);
    expect(dto.description).toBeUndefined();
    expect(dto.imageUrl).toBeUndefined();
  });

  it('rounds fractional cents', () => {
    const dto = toCreateMenuItemDto({
      name: 'Fries',
      priceDollars: 12.999,
      currency: 'USD',
      available: true,
      categoryId: 'cat-1'
    } as never);
    expect(dto.priceCents).toBe(1300);
  });
});

describe('menuItemToFormValues', () => {
  it('converts cents back to dollars', () => {
    const item = {
      priceCents: 1299,
      currency: 'USD',
      name: 'X',
      description: 'd',
      imageUrl: '',
      available: false,
      categoryId: 'cat-2'
    } as MenuItem;
    expect(menuItemToFormValues(item).priceDollars).toBe(12.99);
  });
});
