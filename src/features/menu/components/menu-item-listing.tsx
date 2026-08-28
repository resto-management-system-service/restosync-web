import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { MenuItemTable } from './menu-item-tables';

// Data is fetched on the client: the MSW mock backend runs in the browser only,
// so create/update/delete stay consistent with what the list shows. Swap back to
// server prefetch + HydrationBoundary once the real API is live.
export default function MenuItemListing() {
  return (
    <Suspense fallback={<DataTableSkeleton columnCount={5} filterCount={1} />}>
      <MenuItemTable />
    </Suspense>
  );
}
