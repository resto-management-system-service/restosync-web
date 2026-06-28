import { queryOptions } from '@tanstack/react-query';
import { getMenuItems, getMenuItemById, getCategories } from './service';
import type { MenuItemFilters } from './types';

// ============================================================
// Menu Query Key Factory & Query Options
// ============================================================

export const menuKeys = {
  all: ['menu'] as const,
  items: (filters: MenuItemFilters) => [...menuKeys.all, 'items', filters] as const,
  detail: (id: string) => [...menuKeys.all, 'detail', id] as const,
  categories: () => [...menuKeys.all, 'categories'] as const
};

/**
 * Query options for fetching the list of menu items.
 */
export const menuItemsQueryOptions = (filters: MenuItemFilters = {}) =>
  queryOptions({
    queryKey: menuKeys.items(filters),
    queryFn: () => getMenuItems(filters)
  });

/**
 * Query options for fetching a single menu item.
 */
export const menuItemByIdOptions = (id: string) =>
  queryOptions({
    queryKey: menuKeys.detail(id),
    queryFn: () => getMenuItemById(id),
    enabled: !!id
  });

/**
 * Query options for fetching categories.
 */
export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: menuKeys.categories(),
    queryFn: () => getCategories()
  });
