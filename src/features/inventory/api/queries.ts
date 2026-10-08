import { queryOptions } from '@tanstack/react-query';
import { getInventory, getLowStock } from './service';

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: () => [...inventoryKeys.all, 'list'] as const,
  lowStock: () => [...inventoryKeys.all, 'low-stock'] as const
};

export const inventoryQueryOptions = () =>
  queryOptions({
    queryKey: inventoryKeys.list(),
    queryFn: getInventory,
    staleTime: 0
  });

export const lowStockQueryOptions = () =>
  queryOptions({
    queryKey: inventoryKeys.lowStock(),
    queryFn: getLowStock,
    staleTime: 0
  });
