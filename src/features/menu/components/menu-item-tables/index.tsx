'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useDataTable } from '@/hooks/use-data-table';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import { getSortingStateParser } from '@/lib/parsers';
import { categoriesQueryOptions, menuItemsQueryOptions } from '../../api/queries';
import type { MenuItemFilters } from '../../api/types';
import { buildColumns } from './columns';

const COLUMN_IDS = ['name', 'category', 'price', 'available', 'actions'];

export function MenuItemTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    categoryId: parseAsString,
    available: parseAsString,
    sort: getSortingStateParser(COLUMN_IDS).withDefault([])
  });

  const { data: categories } = useQuery(categoriesQueryOptions());

  const filters: MenuItemFilters = {
    ...(params.name ? { name: params.name } : {}),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.available ? { available: params.available === 'true' } : {})
  };
  const { data, isPending } = useQuery(
    menuItemsQueryOptions({ filters, page: params.page, perPage: params.perPage })
  );
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const categoryName = useMemo(() => {
    const map = new Map((categories ?? []).map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [categories]);

  const columns = useMemo(() => buildColumns(categoryName), [categoryName]);

  const pageCount = Math.max(1, Math.ceil(total / params.perPage));

  const { table } = useDataTable({
    data: items,
    columns,
    pageCount,
    rowCount: total,
    shallow: true,
    debounceMs: 400,
    initialState: { columnPinning: { right: ['actions'] } }
  });

  if (isPending) {
    return <DataTableSkeleton columnCount={5} filterCount={1} />;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
