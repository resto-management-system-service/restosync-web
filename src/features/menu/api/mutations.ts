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

const invalidateAll = () => getQueryClient().invalidateQueries({ queryKey: menuKeys.all });

export const createMenuItemMutation = mutationOptions({
  mutationFn: (data: CreateMenuItemDto) => createMenuItem(data),
  onSuccess: invalidateAll
});

export const updateMenuItemMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateMenuItemDto }) =>
    updateMenuItem(id, values),
  onSuccess: invalidateAll
});

export const deleteMenuItemMutation = mutationOptions({
  mutationFn: (id: string) => deleteMenuItem(id),
  onSuccess: invalidateAll
});

export const createCategoryMutation = mutationOptions({
  mutationFn: (data: CreateCategoryDto) => createCategory(data),
  onSuccess: invalidateAll
});

export const updateCategoryMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateCategoryDto }) =>
    updateCategory(id, values),
  onSuccess: invalidateAll
});

export const deleteCategoryMutation = mutationOptions({
  mutationFn: (id: string) => deleteCategory(id),
  onSuccess: invalidateAll
});
