import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import PageContainer from '@/components/layout/page-container';
import { categoriesQueryOptions, menuItemByIdOptions } from '@/features/menu/api/queries';
import MenuItemViewPage from '@/features/menu/components/menu-item-view-page';

export const metadata = {
  title: 'Dashboard: Menu Item'
};

export default async function Page(props: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await props.params;
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(categoriesQueryOptions());
  if (itemId !== 'new') {
    void queryClient.prefetchQuery(menuItemByIdOptions(itemId));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <MenuItemViewPage itemId={itemId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
