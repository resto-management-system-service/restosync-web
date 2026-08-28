import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import MenuItemViewPage from '@/features/menu/components/menu-item-view-page';

export const metadata = {
  title: 'Dashboard: Menu Item'
};

export default async function Page(props: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await props.params;

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MenuItemViewPage itemId={itemId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
