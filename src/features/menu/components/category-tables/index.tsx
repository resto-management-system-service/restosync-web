'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useDataTable } from '@/hooks/use-data-table';
import { useQuery } from '@tanstack/react-query';
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

  const { data, isPending } = useQuery(categoriesQueryOptions());
  const rows = data ?? [];
  const pageCount = Math.max(1, Math.ceil(rows.length / params.perPage));

  const { table } = useDataTable({
    data: rows,
    columns: categoryColumns,
    pageCount,
    shallow: true,
    initialState: { columnPinning: { right: ['actions'] } }
  });

  if (isPending) {
    return <DataTableSkeleton columnCount={4} />;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
