import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { categoriesQueryOptions } from '../api/queries';
import { CategoryTable } from './category-tables';

export default function CategoryListing() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(categoriesQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoryTable />
    </HydrationBoundary>
  );
}
