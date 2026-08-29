'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import FormCardSkeleton from '@/components/form-card-skeleton';
import { categoryByIdOptions } from '../api/queries';
import { categoryToFormValues } from '../schemas/category';
import CategoryForm from './category-form';

export default function CategoryViewPage({ categoryId }: { categoryId: string }) {
  if (categoryId === 'new') {
    return <CategoryForm pageTitle='Create Category' />;
  }
  return <EditCategory categoryId={categoryId} />;
}

function EditCategory({ categoryId }: { categoryId: string }) {
  const { data, isPending, isError } = useQuery(categoryByIdOptions(categoryId));

  if (isPending) return <FormCardSkeleton />;
  if (isError || !data) notFound();

  return (
    <CategoryForm
      categoryId={categoryId}
      initialValues={categoryToFormValues(data)}
      pageTitle='Edit Category'
    />
  );
}
