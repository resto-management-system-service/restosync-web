import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { adjustStock } from './service';
import { inventoryKeys } from './queries';
import type { AdjustStockDto } from './types';

// Refresh both the list and the low-stock alert after any adjustment.
export const adjustStockMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: AdjustStockDto }) => adjustStock(id, values),
  onSettled: () => getQueryClient().invalidateQueries({ queryKey: inventoryKeys.all })
});
