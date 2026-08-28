import * as z from 'zod';
import { centsToDollars, dollarsToCents } from '@/lib/format';
import type { CreateMenuItemDto, MenuItem, UpdateMenuItemDto } from '../api/types';

export const menuItemFormSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters.'),
  description: z.string().max(500, 'Keep the description under 500 characters.').optional(),
  priceDollars: z
    .number({ message: 'Price is required.' })
    .positive('Price must be greater than 0.'),
  currency: z.string().min(1, 'Select a currency.'),
  imageUrl: z.union([z.string().url('Must be a valid URL.'), z.literal('')]).optional(),
  available: z.boolean(),
  categoryId: z.string().min(1, 'Please select a category.')
});

export type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

const clean = (s?: string) => (s && s.trim().length > 0 ? s : undefined);

export function toCreateMenuItemDto(v: MenuItemFormValues): CreateMenuItemDto {
  return {
    name: v.name,
    description: clean(v.description),
    priceCents: dollarsToCents(v.priceDollars),
    currency: v.currency,
    imageUrl: clean(v.imageUrl),
    available: v.available,
    categoryId: v.categoryId
  };
}

export function toUpdateMenuItemDto(v: MenuItemFormValues): UpdateMenuItemDto {
  return toCreateMenuItemDto(v);
}

export function menuItemToFormValues(item: MenuItem): MenuItemFormValues {
  return {
    name: item.name,
    description: item.description ?? '',
    priceDollars: centsToDollars(item.priceCents),
    currency: item.currency || 'USD',
    imageUrl: item.imageUrl ?? '',
    available: item.available,
    categoryId: item.categoryId
  };
}
