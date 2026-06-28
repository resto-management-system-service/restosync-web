import type {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  CreateCategoryDto,
  UpdateCategoryDto
} from '@/api-client';

// ============================================================
// Types for the Menu Feature
// ============================================================
// These types map the OpenAPI generated types to the frontend
// features, allowing us to augment or refine them if needed.

// Re-export the DTOs from the generated API client
export type { CreateMenuItemDto, UpdateMenuItemDto, CreateCategoryDto, UpdateCategoryDto };

// Define the Menu Item domain type (since response type in OpenAPI is unknown)
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  imageUrl?: string;
  available: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

// Define the Category domain type
export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Filters for listing menu items
export interface MenuItemFilters {
  categoryId?: string;
  available?: boolean;
}
