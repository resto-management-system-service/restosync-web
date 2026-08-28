'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
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

  const { data: categories } = useSuspenseQuery(categoriesQueryOptions());

  const filters: MenuItemFilters = {
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.available ? { available: params.available === 'true' } : {})
  };
  const { data: items } = useSuspenseQuery(menuItemsQueryOptions(filters));

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [categories]);

  const columns = useMemo(() => buildColumns(categoryName), [categoryName]);

  const filtered = useMemo(() => {
    if (!params.name) return items;
    const q = params.name.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, params.name]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / params.perPage));

  const { table } = useDataTable({
    data: filtered,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 400,
    initialState: { columnPinning: { right: ['actions'] } }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
