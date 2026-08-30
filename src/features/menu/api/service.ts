// ============================================================
// Menu Service — Data Access Layer using Generated API Client
// ============================================================
import {
  menuItemsControllerFindAll,
  menuItemsControllerFindOne,
  menuItemsControllerCreate,
  menuItemsControllerUpdate,
  menuItemsControllerRemove,
  categoriesControllerFindAll,
  categoriesControllerFindOne,
  categoriesControllerCreate,
  categoriesControllerUpdate,
  categoriesControllerRemove,
  type CreateMenuItemDto,
  type UpdateMenuItemDto,
  type CreateCategoryDto,
  type UpdateCategoryDto
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

  // The OpenAPI response is typed `unknown`. The real API returns a paginated
  // envelope `{ data, meta }`; tolerate a bare array too (MSW mock / older API).
  // NOTE: the API defaults to 20 items/page. The table paginates client-side,
  // so it only sees the first page until the client is regenerated with the
  // pagination query params and server-side paging is wired.
  if (Array.isArray(data)) return data as MenuItem[];
  const page = (data as { data?: unknown } | null)?.data;
  return Array.isArray(page) ? (page as MenuItem[]) : [];
}

/**
 * Fetch a single menu item by ID.
 */
export async function getMenuItemById(id: string): Promise<MenuItem> {
  const { data, error } = await menuItemsControllerFindOne({ path: { id } });

  if (error) {
    throw new Error(`Menu item not found: ${id}`);
  }

  return data as MenuItem;
}

/**
 * Create a new menu item.
 */
export async function createMenuItem(payload: CreateMenuItemDto): Promise<MenuItem> {
  const { data, error } = await menuItemsControllerCreate({ body: payload });

  if (error) {
    throw new Error(`Failed to create menu item: ${JSON.stringify(error)}`);
  }

  return data as MenuItem;
}

/**
 * Update an existing menu item.
 */
export async function updateMenuItem(id: string, payload: UpdateMenuItemDto): Promise<MenuItem> {
  const { data, error } = await menuItemsControllerUpdate({ path: { id }, body: payload });

  if (error) {
    throw new Error(`Failed to update menu item: ${JSON.stringify(error)}`);
  }

  return data as MenuItem;
}

/**
 * Delete a menu item by ID.
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await menuItemsControllerRemove({ path: { id } });

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

/**
 * Fetch a single category by ID.
 */
export async function getCategoryById(id: string): Promise<Category> {
  const { data, error } = await categoriesControllerFindOne({ path: { id } });

  if (error) {
    throw new Error(`Category not found: ${id}`);
  }

  return data as Category;
}

/**
 * Create a new category.
 */
export async function createCategory(payload: CreateCategoryDto): Promise<Category> {
  const { data, error } = await categoriesControllerCreate({ body: payload });

  if (error) {
    throw new Error(`Failed to create category: ${JSON.stringify(error)}`);
  }

  return data as Category;
}

/**
 * Update an existing category.
 */
export async function updateCategory(id: string, payload: UpdateCategoryDto): Promise<Category> {
  const { data, error } = await categoriesControllerUpdate({ path: { id }, body: payload });

  if (error) {
    throw new Error(`Failed to update category: ${JSON.stringify(error)}`);
  }

  return data as Category;
}

/**
 * Delete a category by ID.
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await categoriesControllerRemove({ path: { id } });

  if (error) {
    throw new Error(`Failed to delete category: ${JSON.stringify(error)}`);
  }
}
