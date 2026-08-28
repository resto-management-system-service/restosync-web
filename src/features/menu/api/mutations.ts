import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  updateCategory,
  deleteCategory
} from './service';
import { menuKeys } from './queries';
import type {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateCategoryDto,
  UpdateCategoryDto
} from './types';

// ============================================================
// Menu Mutation Configuration
// ============================================================
// Invalidation runs in `onSettled`, not `onSuccess`, so a component that spreads
// one of these and adds its own `onSuccess` (toast, navigation) does not clobber
// the cache refresh.

const invalidateAll = () => getQueryClient().invalidateQueries({ queryKey: menuKeys.all });

export const createMenuItemMutation = mutationOptions({
  mutationFn: (data: CreateMenuItemDto) => createMenuItem(data),
  onSettled: invalidateAll
});

export const updateMenuItemMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateMenuItemDto }) =>
    updateMenuItem(id, values),
  onSettled: invalidateAll
});

export const deleteMenuItemMutation = mutationOptions({
  mutationFn: (id: string) => deleteMenuItem(id),
  onSettled: invalidateAll
});

export const createCategoryMutation = mutationOptions({
  mutationFn: (data: CreateCategoryDto) => createCategory(data),
  onSettled: invalidateAll
});

export const updateCategoryMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateCategoryDto }) =>
    updateCategory(id, values),
  onSettled: invalidateAll
});

export const deleteCategoryMutation = mutationOptions({
  mutationFn: (id: string) => deleteCategory(id),
  onSettled: invalidateAll
});
