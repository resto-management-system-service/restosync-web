import { getQueryClient } from '@/lib/query-client';
import { createMenuItem, updateMenuItem, deleteMenuItem } from './service';
import { menuKeys } from './queries';
import type { CreateMenuItemDto, UpdateMenuItemDto } from './types';

// ============================================================
// Menu Mutation Configuration
// ============================================================

export const createMenuItemMutation = {
  mutationFn: (data: CreateMenuItemDto) => createMenuItem(data),
  onSuccess: () => {
    // Invalidate menu items list to trigger refetch
    getQueryClient().invalidateQueries({ queryKey: menuKeys.all });
  }
};

export const updateMenuItemMutation = {
  mutationFn: ({ id, values }: { id: string; values: UpdateMenuItemDto }) =>
    updateMenuItem(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: menuKeys.all });
  }
};

export const deleteMenuItemMutation = {
  mutationFn: (id: string) => deleteMenuItem(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: menuKeys.all });
  }
};
