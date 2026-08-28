import * as z from 'zod';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../api/types';

export const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  sortOrder: z
    .number({ message: 'Sort order is required.' })
    .int('Must be a whole number.')
    .min(0, 'Must be 0 or more.'),
  active: z.boolean()
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function toCreateCategoryDto(v: CategoryFormValues): CreateCategoryDto {
  return { name: v.name, sortOrder: v.sortOrder, active: v.active };
}

export function toUpdateCategoryDto(v: CategoryFormValues): UpdateCategoryDto {
  return { name: v.name, sortOrder: v.sortOrder, active: v.active };
}

export function categoryToFormValues(c: Category): CategoryFormValues {
  return { name: c.name, sortOrder: c.sortOrder, active: c.active };
}
