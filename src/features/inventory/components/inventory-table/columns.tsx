'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { isLowStock, type InventoryItem } from '../../api/types';
import { AdjustStockDialog } from '../adjust-stock-dialog';

function AdjustAction({ item }: { item: InventoryItem }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant='outline' size='sm' onClick={() => setOpen(true)}>
        Adjust
      </Button>
      {open && <AdjustStockDialog item={item} open={open} onOpenChange={setOpen} />}
    </>
  );
}

export const columns: ColumnDef<InventoryItem>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Product' />
    ),
    cell: ({ cell }) => <div className='font-medium'>{cell.getValue<string>()}</div>,
    meta: {
      label: 'Product',
      placeholder: 'Search products...',
      variant: 'text',
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'quantityOnHand',
    accessorKey: 'quantityOnHand',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='In stock' />
    ),
    cell: ({ row }) => {
      const low = isLowStock(row.original);
      return (
        <span className={low ? 'text-destructive font-semibold' : undefined}>
          {row.original.quantityOnHand} {row.original.unit}
        </span>
      );
    }
  },
  {
    id: 'lowStockThreshold',
    accessorKey: 'lowStockThreshold',
    enableSorting: false,
    header: 'Alert at',
    cell: ({ row }) => `${row.original.lowStockThreshold} ${row.original.unit}`
  },
  {
    id: 'status',
    enableSorting: false,
    header: 'Status',
    cell: ({ row }) =>
      isLowStock(row.original) ? (
        <Badge variant='destructive'>
          <Icons.warning className='mr-1 h-3 w-3' />
          Low stock
        </Badge>
      ) : (
        <Badge variant='outline'>
          <Icons.circleCheck className='mr-1 h-3 w-3' />
          OK
        </Badge>
      )
  },
  { id: 'actions', cell: ({ row }) => <AdjustAction item={row.original} /> }
];
