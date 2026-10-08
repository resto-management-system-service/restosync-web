'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useDataTable } from '@/hooks/use-data-table';
import { useQuery } from '@tanstack/react-query';
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import { getSortingStateParser } from '@/lib/parsers';
import { inventoryQueryOptions } from '../../api/queries';
import { isLowStock } from '../../api/types';
import { columns } from './columns';

const COLUMN_IDS = ['name', 'quantityOnHand'];

export function InventoryTable() {
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    lowStock: parseAsBoolean.withDefault(false),
    sort: getSortingStateParser(COLUMN_IDS).withDefault([])
  });

  const { data, isPending, isError } = useQuery(inventoryQueryOptions());
  const all = useMemo(() => data ?? [], [data]);
  const lowCount = useMemo(() => all.filter(isLowStock).length, [all]);

  const filtered = useMemo(() => {
    const term = params.name?.trim().toLowerCase();
    const rows = all.filter(
      (i) => (!term || i.name.toLowerCase().includes(term)) && (!params.lowStock || isLowStock(i))
    );
    const sort = params.sort[0];
    if (sort) {
      const dir = sort.desc ? -1 : 1;
      rows.sort((a, b) =>
        sort.id === 'quantityOnHand'
          ? (a.quantityOnHand - b.quantityOnHand) * dir
          : a.name.localeCompare(b.name) * dir
      );
    }
    return rows;
  }, [all, params.name, params.lowStock, params.sort]);

  const pageRows = filtered.slice((params.page - 1) * params.perPage, params.page * params.perPage);
  const pageCount = Math.max(1, Math.ceil(filtered.length / params.perPage));

  const { table } = useDataTable({
    data: pageRows,
    columns,
    pageCount,
    rowCount: filtered.length,
    shallow: true,
    debounceMs: 400,
    initialState: { columnPinning: { right: ['actions'] } }
  });

  if (isPending) return <DataTableSkeleton columnCount={5} filterCount={1} />;
  if (isError) {
    return (
      <Alert variant='destructive'>
        <Icons.alertCircle className='h-4 w-4' />
        <AlertTitle>Could not load inventory</AlertTitle>
        <AlertDescription>Please try again in a moment.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-4'>
      {lowCount > 0 && (
        <Alert variant='destructive'>
          <Icons.warning className='h-4 w-4' />
          <AlertTitle>
            {lowCount} {lowCount === 1 ? 'product is' : 'products are'} low on stock
          </AlertTitle>
          <AlertDescription>
            <Button
              variant='link'
              className='h-auto p-0 text-current underline'
              onClick={() => setParams({ lowStock: !params.lowStock, page: 1 })}
            >
              {params.lowStock ? 'Show all products' : 'Show only low stock'}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
