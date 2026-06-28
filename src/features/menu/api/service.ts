// ============================================================
// Menu Service — Data Access Layer using Generated API Client
// ============================================================
import {
  menuItemsControllerFindAll,
  menuItemsControllerCreate,
  menuItemsControllerUpdate,
  menuItemsControllerRemove,
  categoriesControllerFindAll,
  type CreateMenuItemDto,
  type UpdateMenuItemDto
} from '@/api-client';
import type { MenuItem, Category, MenuItemFilters } from './types';

/**
 * Fetch all menu items, optionally filtered by category or availability.
 */
export async function getMenuItems(filters?: MenuItemFilters): Promise<MenuItem[]> {
  const { data, error } = await menuItemsControllerFindAll({
    query: {
      categoryId: filters?.categoryId,
      available: filters?.available
    }
  });

  if (error) {
    throw new Error(`Failed to fetch menu items: ${JSON.stringify(error)}`);
  }

  // Cast the 'unknown' response from OpenAPI to our concrete type
  return (data as MenuItem[]) ?? [];
}

/**
 * Fetch a single menu item by ID.
 */
export async function getMenuItemById(id: string): Promise<MenuItem> {
  // Use client-fetch helper with throwOnError option
  const { data } = await menuItemsControllerFindAll({
    query: { categoryId: undefined },
    throwOnError: true
  });

  const item = (data as MenuItem[])?.find((i) => i.id === id);
  if (!item) {
    throw new Error(`Menu item not found: ${id}`);
  }
  return item;
}

/**
 * Create a new menu item.
 */
export async function createMenuItem(payload: CreateMenuItemDto): Promise<MenuItem> {
  const { data, error } = await menuItemsControllerCreate({
    body: payload
  });

  if (error) {
    throw new Error(`Failed to create menu item: ${JSON.stringify(error)}`);
  }

  return data as MenuItem;
}

/**
 * Update an existing menu item.
 */
export async function updateMenuItem(id: string, payload: UpdateMenuItemDto): Promise<MenuItem> {
  const { data, error } = await menuItemsControllerUpdate({
    path: { id },
    body: payload
  });

  if (error) {
    throw new Error(`Failed to update menu item: ${JSON.stringify(error)}`);
  }

  return data as MenuItem;
}

/**
 * Delete a menu item by ID.
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await menuItemsControllerRemove({
    path: { id }
  });

  if (error) {
    throw new Error(`Failed to delete menu item: ${JSON.stringify(error)}`);
  }
}

/**
 * Fetch all menu categories.
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await categoriesControllerFindAll();

  if (error) {
    throw new Error(`Failed to fetch categories: ${JSON.stringify(error)}`);
  }

  return (data as Category[]) ?? [];
}
