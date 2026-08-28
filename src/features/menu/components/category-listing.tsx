import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { CategoryTable } from './category-tables';

// Client-fetched — see the note in menu-item-listing.tsx.
export default function CategoryListing() {
  return (
    <Suspense fallback={<DataTableSkeleton columnCount={4} />}>
      <CategoryTable />
    </Suspense>
  );
}
