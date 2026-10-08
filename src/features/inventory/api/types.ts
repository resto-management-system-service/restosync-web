import type { AdjustStockDto, CreateInventoryItemDto } from '@/api-client';

export type { AdjustStockDto, CreateInventoryItemDto };

export type StockAdjustmentType = AdjustStockDto['type'];

// The OpenAPI response for /inventory is `unknown`; this mirrors the backend entity.
export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantityOnHand: number;
  lowStockThreshold: number;
  menuItemId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  name?: string;
  lowStockOnly?: boolean;
}

export const isLowStock = (item: Pick<InventoryItem, 'quantityOnHand' | 'lowStockThreshold'>) =>
  item.quantityOnHand <= item.lowStockThreshold;
