'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { menuItemSchema, type MenuItemFormValues } from '@/features/menu/schemas/menu-item';
import { menuCategoryOptions } from '@/features/menu/constants/menu-options';

export default function MenuItemForm({
  initialData,
  pageTitle
}: {
  initialData?: Partial<MenuItemFormValues> | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      category: initialData?.category ?? '',
      price: initialData?.price,
      description: initialData?.description ?? '',
      available: initialData?.available ?? true
    } as MenuItemFormValues,
    validators: {
      onSubmit: menuItemSchema
    },
    onSubmit: ({ value }) => {
      // No backend yet — log the validated payload and toast.
      // Wire this to a mutation (see features/products/api) when the API is ready.
      // eslint-disable-next-line no-console
      console.log('Menu item submitted:', value);
      toast.success(isEdit ? 'Menu item updated' : 'Menu item created', {
        description: `${value.name} — $${value.price?.toFixed(2)}`
      });
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
                name='category'
                label='Category'
                required
                options={menuCategoryOptions}
                placeholder='Select category'
                validators={{
                  onBlur: z.string().min(1, 'Please select a category.')
                }}
              />

              <FormTextField
                name='price'
                label='Price'
                required
                type='number'
                min={0}
                step={0.01}
                placeholder='Enter price'
                validators={{
                  onBlur: z
                    .number({ message: 'Price is required.' })
                    .positive('Price must be greater than 0.')
                }}
              />
            </div>

            <FormTextareaField
              name='description'
              label='Description'
              required
              placeholder='Describe the dish, ingredients, etc.'
              maxLength={500}
              rows={4}
              validators={{
                onBlur: z.string().min(10, 'Description must be at least 10 characters.')
              }}
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
