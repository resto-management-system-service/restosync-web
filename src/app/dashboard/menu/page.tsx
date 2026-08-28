import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SearchParams } from 'nuqs/server';
import { searchParamsCache } from '@/lib/searchparams';
import MenuItemListing from '@/features/menu/components/menu-item-listing';

export const metadata = {
  title: 'Dashboard: Menu Items'
};

export default async function Page(props: { searchParams: Promise<SearchParams> }) {
  searchParamsCache.parse(await props.searchParams);

  return (
    <PageContainer
      pageTitle='Menu Items'
      pageDescription='Manage the dishes on your menu.'
      pageHeaderAction={
        <Link href='/dashboard/menu/new' className={cn(buttonVariants(), 'text-xs md:text-sm')}>
          <Icons.add className='mr-2 h-4 w-4' /> Add Item
        </Link>
      }
    >
      <MenuItemListing />
    </PageContainer>
  );
}
