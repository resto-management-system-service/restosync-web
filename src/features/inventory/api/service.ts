import {
  inventoryControllerFindAll,
  inventoryControllerFindLowStock,
  inventoryControllerAdjust
} from '@/api-client';
import type { AdjustStockDto, InventoryItem } from './types';

// Postgres decimals can arrive as strings; normalise to numbers once, here.
function normalize(raw: InventoryItem): InventoryItem {
  return {
    ...raw,
    quantityOnHand: Number(raw.quantityOnHand ?? 0),
    lowStockThreshold: Number(raw.lowStockThreshold ?? 0)
  };
}

// Tolerate a bare array or a `{ data }` envelope.
function toList(data: unknown): InventoryItem[] {
  const list = Array.isArray(data) ? data : (data as { data?: unknown } | null)?.data;
  return Array.isArray(list) ? (list as InventoryItem[]).map(normalize) : [];
}

export async function getInventory(): Promise<InventoryItem[]> {
  const { data, error } = await inventoryControllerFindAll();
  if (error) throw new Error(`Failed to fetch inventory: ${JSON.stringify(error)}`);
  return toList(data);
}

export async function getLowStock(): Promise<InventoryItem[]> {
  const { data, error } = await inventoryControllerFindLowStock();
  if (error) throw new Error(`Failed to fetch low stock items: ${JSON.stringify(error)}`);
  return toList(data);
}

export async function adjustStock(id: string, payload: AdjustStockDto): Promise<void> {
  const { error } = await inventoryControllerAdjust({
    path: { id },
    body: payload
  });
  if (error) throw new Error(`Failed to adjust stock: ${JSON.stringify(error)}`);
}
