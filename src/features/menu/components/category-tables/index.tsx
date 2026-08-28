'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { categoriesQueryOptions } from '../../api/queries';
import { categoryColumns } from './columns';

const COLUMN_IDS = ['name', 'sortOrder', 'active', 'actions'];

export function CategoryTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser(COLUMN_IDS).withDefault([])
  });

  const { data } = useSuspenseQuery(categoriesQueryOptions());
  const pageCount = Math.max(1, Math.ceil(data.length / params.perPage));

  const { table } = useDataTable({
    data,
    columns: categoryColumns,
    pageCount,
    shallow: true,
    initialState: { columnPinning: { right: ['actions'] } }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
