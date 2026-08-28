'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
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
  const { data } = useSuspenseQuery(categoryByIdOptions(categoryId));
  if (!data) notFound();
  return (
    <CategoryForm
      categoryId={categoryId}
      initialValues={categoryToFormValues(data)}
      pageTitle='Edit Category'
    />
  );
}
