'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { createCategoryMutation, updateCategoryMutation } from '../api/mutations';
import {
  categoryFormSchema,
  toCreateCategoryDto,
  toUpdateCategoryDto,
  type CategoryFormValues
} from '../schemas/category';

const EMPTY: CategoryFormValues = { name: '', sortOrder: 0, active: true };

export default function CategoryForm({
  categoryId,
  initialValues,
  pageTitle
}: {
  categoryId?: string;
  initialValues?: CategoryFormValues;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = !!categoryId;

  const createMutation = useMutation({
    ...createCategoryMutation,
    onSuccess: () => {
      toast.success('Category created');
      router.push('/dashboard/menu/categories');
    },
    onError: () => toast.error('Failed to create category')
  });

  const updateMutation = useMutation({
    ...updateCategoryMutation,
    onSuccess: () => {
      toast.success('Category updated');
      router.push('/dashboard/menu/categories');
    },
    onError: () => toast.error('Failed to update category')
  });

  const form = useAppForm({
    defaultValues: initialValues ?? EMPTY,
    validators: { onSubmit: categoryFormSchema },
    onSubmit: ({ value }) => {
      if (isEdit && categoryId) {
        updateMutation.mutate({ id: categoryId, values: toUpdateCategoryDto(value) });
      } else {
        createMutation.mutate(toCreateCategoryDto(value));
      }
    }
  });

  const { FormTextField, FormSwitchField } = useFormFields<CategoryFormValues>();

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
                label='Name'
                required
                placeholder='e.g. Desserts'
                validators={{ onBlur: z.string().min(2, 'Name must be at least 2 characters.') }}
              />
              <FormTextField
                name='sortOrder'
                label='Sort Order'
                required
                type='number'
                min={0}
                step={1}
                placeholder='0'
                validators={{ onBlur: z.number().int().min(0, 'Must be 0 or more.') }}
              />
            </div>

            <FormSwitchField
              name='active'
              label='Active'
              description='Inactive categories stay hidden from the storefront menu.'
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Category' : 'Add Category'}</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
