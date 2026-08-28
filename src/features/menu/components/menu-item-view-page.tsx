'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { menuItemByIdOptions } from '../api/queries';
import { menuItemToFormValues } from '../schemas/menu-item';
import MenuItemForm from './menu-item-form';

export default function MenuItemViewPage({ itemId }: { itemId: string }) {
  if (itemId === 'new') {
    return <MenuItemForm pageTitle='Create Menu Item' />;
  }
  return <EditMenuItem itemId={itemId} />;
}

function EditMenuItem({ itemId }: { itemId: string }) {
  const { data } = useSuspenseQuery(menuItemByIdOptions(itemId));
  if (!data) notFound();
  return (
    <MenuItemForm
      menuItemId={itemId}
      initialValues={menuItemToFormValues(data)}
      pageTitle='Edit Menu Item'
    />
  );
}
