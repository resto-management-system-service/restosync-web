import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { categoriesQueryOptions, menuItemsQueryOptions } from '../api/queries';
import type { MenuItemFilters } from '../api/types';
import { MenuItemTable } from './menu-item-tables';

export default function MenuItemListing() {
  const categoryId = searchParamsCache.get('categoryId');
  const available = searchParamsCache.get('available');

  const filters: MenuItemFilters = {
    ...(categoryId ? { categoryId } : {}),
    ...(available ? { available: available === 'true' } : {})
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(categoriesQueryOptions());
  void queryClient.prefetchQuery(menuItemsQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MenuItemTable />
    </HydrationBoundary>
  );
}
