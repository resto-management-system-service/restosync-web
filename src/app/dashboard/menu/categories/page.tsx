import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CategoryTable } from '@/features/menu/components/category-tables';

export const metadata = {
  title: 'Dashboard: Menu Categories'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Menu Categories'
      pageDescription='Group menu items into sections.'
      pageHeaderAction={
        <Link
          href='/dashboard/menu/categories/new'
          prefetch={false}
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <Icons.add className='mr-2 h-4 w-4' /> Add Category
        </Link>
      }
    >
      <CategoryTable />
    </PageContainer>
  );
}
