'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatPriceCents } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { MenuItem } from '../../api/types';
import { CellAction } from './cell-action';

export function buildColumns(categoryName: (id: string) => string): ColumnDef<MenuItem>[] {
  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }: { column: Column<MenuItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ cell }) => <div className='font-medium'>{cell.getValue<string>()}</div>,
      meta: { label: 'Name', placeholder: 'Search items...', variant: 'text', icon: Icons.text },
      enableColumnFilter: true
    },
    {
      id: 'category',
      accessorKey: 'categoryId',
      enableSorting: false,
      header: 'Category',
      cell: ({ cell }) => <Badge variant='outline'>{categoryName(cell.getValue<string>())}</Badge>
    },
    {
      id: 'price',
      accessorKey: 'priceCents',
      header: ({ column }: { column: Column<MenuItem, unknown> }) => (
        <DataTableColumnHeader column={column} title='Price' />
      ),
      cell: ({ row }) => formatPriceCents(row.original.priceCents, row.original.currency)
    },
    {
      id: 'available',
      accessorKey: 'available',
      enableSorting: false,
      header: 'Status',
      cell: ({ cell }) => {
        const ok = cell.getValue<boolean>();
        const Icon = ok ? Icons.circleCheck : Icons.xCircle;
        return (
          <Badge variant='outline' className='capitalize'>
            <Icon className='mr-1 h-3 w-3' />
            {ok ? 'available' : 'unavailable'}
          </Badge>
        );
      }
    },
    { id: 'actions', cell: ({ row }) => <CellAction data={row.original} /> }
  ];
}
