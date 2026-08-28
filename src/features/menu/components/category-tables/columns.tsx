'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Category } from '../../api/types';
import { CellAction } from './cell-action';

export const categoryColumns: ColumnDef<Category>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Category, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div className='font-medium'>{cell.getValue<string>()}</div>
  },
  {
    id: 'sortOrder',
    accessorKey: 'sortOrder',
    header: ({ column }: { column: Column<Category, unknown> }) => (
      <DataTableColumnHeader column={column} title='Sort Order' />
    )
  },
  {
    id: 'active',
    accessorKey: 'active',
    enableSorting: false,
    header: 'Status',
    cell: ({ cell }) => (
      <Badge variant='outline' className='capitalize'>
        {cell.getValue<boolean>() ? 'active' : 'inactive'}
      </Badge>
    )
  },
  { id: 'actions', cell: ({ row }) => <CellAction data={row.original} /> }
];
