import PageContainer from '@/components/layout/page-container';
import type { SearchParams } from 'nuqs/server';
import { searchParamsCache } from '@/lib/searchparams';
import { InventoryTable } from '@/features/inventory/components/inventory-table';

export const metadata = {
  title: 'Dashboard: Inventory'
};

export default async function Page(props: { searchParams: Promise<SearchParams> }) {
  searchParamsCache.parse(await props.searchParams);

  return (
    <PageContainer
      pageTitle='Inventory'
      pageDescription='Track stock levels and record manual adjustments.'
    >
      <InventoryTable />
    </PageContainer>
  );
}
