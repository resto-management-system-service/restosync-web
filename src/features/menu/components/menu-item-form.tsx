'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { categoriesQueryOptions } from '../api/queries';
import { createMenuItemMutation, updateMenuItemMutation } from '../api/mutations';
import { currencyOptions } from '../constants/menu-options';
import {
  menuItemFormSchema,
  toCreateMenuItemDto,
  toUpdateMenuItemDto,
  type MenuItemFormValues
} from '../schemas/menu-item';

const EMPTY: MenuItemFormValues = {
  name: '',
  description: '',
  priceDollars: undefined as unknown as number,
  currency: 'USD',
  imageUrl: '',
  available: true,
  categoryId: ''
};

export default function MenuItemForm({
  menuItemId,
  initialValues,
  pageTitle
}: {
  menuItemId?: string;
  initialValues?: MenuItemFormValues;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!menuItemId;

  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const createMutation = useMutation({
    ...createMenuItemMutation,
    onSuccess: () => {
      toast.success('Menu item created');
      router.push('/dashboard/menu');
    },
    onError: () => toast.error('Failed to create menu item')
  });

  const updateMutation = useMutation({
    ...updateMenuItemMutation,
    onSuccess: () => {
      toast.success('Menu item updated');
      router.push('/dashboard/menu');
    },
    onError: () => toast.error('Failed to update menu item')
  });

  const form = useAppForm({
    defaultValues: initialValues ?? EMPTY,
    validators: { onSubmit: menuItemFormSchema },
    onSubmit: ({ value }) => {
      if (isEdit && menuItemId) {
        updateMutation.mutate({ id: menuItemId, values: toUpdateMenuItemDto(value) });
      } else {
        createMutation.mutate(toCreateMenuItemDto(value));
      }
    }
  });

  const { FormTextField, FormSelectField, FormTextareaField, FormSwitchField } =
    useFormFields<MenuItemFormValues>();

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormTextField
                name='name'
                label='Item Name'
                required
                placeholder='e.g. Margherita Pizza'
                validators={{
                  onBlur: z.string().min(2, 'Item name must be at least 2 characters.')
                }}
              />

              <FormSelectField
                name='categoryId'
                label='Category'
                required
                options={categoryOptions}
                placeholder='Select category'
              />

              <FormTextField
                name='priceDollars'
                label='Price'
                required
                type='number'
                min={0}
                step={0.01}
                placeholder='0.00'
                validators={{
                  onBlur: z
                    .number({ message: 'Price is required.' })
                    .positive('Price must be greater than 0.')
                }}
              />

              <FormSelectField
                name='currency'
                label='Currency'
                required
                options={currencyOptions}
                placeholder='Select currency'
              />

              <FormTextField name='imageUrl' label='Image URL' placeholder='https://…' />
            </div>

            <FormTextareaField
              name='description'
              label='Description'
              placeholder='Describe the dish, ingredients, etc.'
              maxLength={500}
              rows={4}
            />

            <FormSwitchField
              name='available'
              label='Available'
              description='Toggle off to hide this item from the menu (e.g. out of stock).'
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Item' : 'Add Item'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
