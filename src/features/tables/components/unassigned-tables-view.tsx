'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { Table, Zone } from '../api/types';
import { STATUS_COLORS, STATUS_LABEL } from '../lib/layout';

interface UnassignedTablesViewProps {
  tables: Table[];
  zones: Zone[];
  onReassign: (table: Table, zoneId: string) => void;
  onDelete: (table: Table) => void;
}

export default function UnassignedTablesView({
  tables,
  zones,
  onReassign,
  onDelete
}: UnassignedTablesViewProps) {
  if (tables.length === 0) {
    return (
      <div className='text-muted-foreground rounded-lg border p-6 text-center text-sm'>
        No hay mesas sin asignar.
      </div>
    );
  }

  return (
    <div className='rounded-lg border'>
      <ul className='divide-y'>
        {tables.map((table) => (
          <li key={table.id} className='flex items-center justify-between gap-3 px-4 py-3'>
            <div className='flex items-center gap-4'>
              <span className='font-medium'>{table.name}</span>
              <span className='text-muted-foreground text-sm'>
                Capacidad {table.capacity ?? '—'}
              </span>
              <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                <span
                  className='size-2 rounded-full'
                  style={{ backgroundColor: STATUS_COLORS[table.status].fill }}
                />
                {STATUS_LABEL[table.status]}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Select onValueChange={(zoneId) => onReassign(table, zoneId)}>
                <SelectTrigger size='sm' className='w-40' aria-label={`Reasignar ${table.name}`}>
                  <SelectValue placeholder='Reasignar a...' />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='text-destructive'
                aria-label={`Eliminar ${table.name}`}
                onClick={() => onDelete(table)}
              >
                <Icons.trash className='h-4 w-4' />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
