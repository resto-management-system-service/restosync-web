import PageContainer from '@/components/layout/page-container';
import CategoryViewPage from '@/features/menu/components/category-view-page';

export const metadata = {
  title: 'Dashboard: Menu Category'
};

export default async function Page(props: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await props.params;

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <CategoryViewPage categoryId={categoryId} />
      </div>
    </PageContainer>
  );
}
