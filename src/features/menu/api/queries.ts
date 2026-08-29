import { queryOptions } from '@tanstack/react-query';
import { getMenuItems, getMenuItemById, getCategories, getCategoryById } from './service';
import type { MenuItemFilters } from './types';

// ============================================================
// Menu Query Key Factory & Query Options
// ============================================================
// `staleTime: 0` on every menu query: server-side prefetch runs against the Node
// MSW instance, which shares only the seed with the browser MSW instance. Marking
// hydrated data immediately stale makes the client refetch from the browser store
// on mount, so what you see always matches the store your mutations write to.

export const menuKeys = {
  all: ['menu'] as const,
  items: (filters: MenuItemFilters) => [...menuKeys.all, 'items', filters] as const,
  detail: (id: string) => [...menuKeys.all, 'detail', id] as const,
  categories: () => [...menuKeys.all, 'categories'] as const,
  category: (id: string) => [...menuKeys.all, 'category', id] as const
};

export const menuItemsQueryOptions = (filters: MenuItemFilters = {}) =>
  queryOptions({
    queryKey: menuKeys.items(filters),
    queryFn: () => getMenuItems(filters),
    staleTime: 0
  });

export const menuItemByIdOptions = (id: string) =>
  queryOptions({
    queryKey: menuKeys.detail(id),
    queryFn: () => getMenuItemById(id),
    enabled: !!id,
    staleTime: 0
  });

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: menuKeys.categories(),
    queryFn: () => getCategories(),
    staleTime: 0
  });

export const categoryByIdOptions = (id: string) =>
  queryOptions({
    queryKey: menuKeys.category(id),
    queryFn: () => getCategoryById(id),
    enabled: !!id,
    staleTime: 0
  });
