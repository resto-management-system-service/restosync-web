import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import PageContainer from '@/components/layout/page-container';
import { categoryByIdOptions } from '@/features/menu/api/queries';
import CategoryViewPage from '@/features/menu/components/category-view-page';

export const metadata = {
  title: 'Dashboard: Menu Category'
};

export default async function Page(props: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await props.params;
  const queryClient = getQueryClient();

  if (categoryId !== 'new') {
    void queryClient.prefetchQuery(categoryByIdOptions(categoryId));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <CategoryViewPage categoryId={categoryId} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
