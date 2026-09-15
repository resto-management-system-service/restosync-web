'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  deleteTableMutation,
  tablesByZoneQueryOptions,
  updateTableLayoutMutation,
  zonesQueryOptions
} from '../api/tables.queries';
import type { TableLayout, TableLayoutUpdate } from '../api/mock-data';
import AddTableSheet from './add-table-sheet';
import DeleteTableDialog from './delete-table-dialog';
import ZoneTabs from './zone-tabs';

const TableMapCanvas = dynamic(() => import('./table-map-canvas'), {
  ssr: false,
  loading: () => <div className='bg-muted h-[480px] w-full animate-pulse rounded-lg' />
});

export default function FloorPlanView() {
  const { data: zones = [] } = useQuery(zonesQueryOptions());
  const [activeZoneId, setActiveZoneId] = useState('');
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TableLayout | null>(null);

  const activeZone = zones.find((z) => z.id === activeZoneId) ?? zones[0] ?? null;
  const effectiveZoneId = activeZone?.id ?? '';

  const { data: tables = [] } = useQuery(tablesByZoneQueryOptions(effectiveZoneId));

  const updateMutation = useMutation(updateTableLayoutMutation);

  const deleteMutation = useMutation({
    ...deleteTableMutation,
    onSuccess: () => {
      setPendingDelete(null);
      toast.success('Mesa eliminada');
    }
  });

  const handleUpdateTable = (id: string, layout: TableLayoutUpdate) => {
    updateMutation.mutate({ id, layout });
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <ZoneTabs
          zones={zones}
          activeZoneId={effectiveZoneId}
          onZoneChange={setActiveZoneId}
          onZoneCreated={(zoneId) => setActiveZoneId(zoneId)}
        />
        <Button
          type='button'
          variant={editing ? 'default' : 'outline'}
          onClick={() => setEditing((prev) => !prev)}
        >
          <Icons.edit className='mr-2 h-4 w-4' />
          {editing ? 'Guardar mapa' : 'Editar mapa'}
        </Button>
      </div>

      <div className='relative rounded-lg border'>
        <TableMapCanvas
          tables={tables}
          editing={editing}
          onUpdateTable={handleUpdateTable}
          onSelectTable={(table) => toast.info(`Abrir orden de la mesa ${table.name}`)}
          onDeleteRequest={setPendingDelete}
        />
        {editing && (
          <Button
            type='button'
            className='absolute right-4 bottom-4 shadow-lg'
            onClick={() => setAddOpen(true)}
          >
            <Icons.add className='mr-2 h-4 w-4' />
            Agregar mesa
          </Button>
        )}
      </div>

      <AddTableSheet open={addOpen} onOpenChange={setAddOpen} zoneId={effectiveZoneId} />
      <DeleteTableDialog
        table={pendingDelete}
        onConfirm={(table) => deleteMutation.mutate(table.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
