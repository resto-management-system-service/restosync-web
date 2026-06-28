import PageContainer from '@/components/layout/page-container';
import MenuItemForm from '@/features/menu/components/menu-item-form';

export const metadata = {
  title: 'Dashboard: Menu Item'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Add Menu Item'
      pageDescription='Create a menu item — validated with TanStack Form + Zod.'
    >
      <MenuItemForm pageTitle='Menu Item Details' />
    </PageContainer>
  );
}
