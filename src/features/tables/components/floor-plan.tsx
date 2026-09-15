'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import type { UpdateTableLayoutDto } from '@/api-client';
import {
  deleteTableMutation,
  tablesQueryOptions,
  updateTableLayoutMutation,
  zonesQueryOptions
} from '../api/tables.queries';
import type { Table } from '../api/types';
import type { TableMapCanvasHandle } from './table-map-canvas';
import AddTableSheet from './add-table-sheet';
import DeleteTableDialog from './delete-table-dialog';
import ZoneTabs from './zone-tabs';

const TableMapCanvas = dynamic(() => import('./table-map-canvas'), {
  ssr: false,
  loading: () => <div className='bg-muted h-[480px] w-full animate-pulse rounded-lg' />
});

export default function FloorPlanView() {
  const [activeZoneId, setActiveZoneId] = useState('');
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Table | null>(null);
  const [pendingEdit, setPendingEdit] = useState<Table | null>(null);
  const canvasRef = useRef<TableMapCanvasHandle>(null);

  const zonesQuery = useQuery(zonesQueryOptions());
  const tablesQuery = useQuery(tablesQueryOptions());

  const zones = zonesQuery.data ?? [];
  const tables = tablesQuery.data ?? [];

  const activeZone = zones.find((z) => z.id === activeZoneId) ?? zones[0] ?? null;
  const effectiveZoneId = activeZone?.id ?? '';
  const zoneTables = tables.filter((t) => t.zoneId === effectiveZoneId);

  const updateMutation = useMutation(updateTableLayoutMutation);

  const deleteMutation = useMutation({
    ...deleteTableMutation,
    onSuccess: () => {
      setPendingDelete(null);
      toast.success('Mesa eliminada');
    }
  });

  const handleUpdateTable = (id: string, layout: UpdateTableLayoutDto) => {
    updateMutation.mutate({ id, layout });
  };

  const isLoading = zonesQuery.isPending || tablesQuery.isPending;
  const isError = zonesQuery.isError || tablesQuery.isError;

  const sheetOpen = addOpen || pendingEdit !== null;

  const closeSheet = () => {
    setAddOpen(false);
    setPendingEdit(null);
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {zonesQuery.isPending ? (
          <div className='flex gap-2'>
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-9 w-24' />
            <Skeleton className='h-9 w-24' />
          </div>
        ) : (
          <ZoneTabs
            zones={zones}
            activeZoneId={effectiveZoneId}
            onZoneChange={setActiveZoneId}
            onZoneCreated={(zoneId) => setActiveZoneId(zoneId)}
          />
        )}
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => canvasRef.current?.fitToView()}
            disabled={isLoading || isError}
          >
            <Icons.zoomScan className='mr-2 h-4 w-4' />
            Centrar mapa
          </Button>
          <Button
            type='button'
            variant={editing ? 'default' : 'outline'}
            onClick={() => setEditing((prev) => !prev)}
          >
            <Icons.edit className='mr-2 h-4 w-4' />
            {editing ? 'Guardar mapa' : 'Editar mapa'}
          </Button>
        </div>
      </div>

      <div className='relative rounded-lg border'>
        {isError ? (
          <Alert variant='destructive' className='m-4'>
            <Icons.alertCircle className='h-4 w-4' />
            <AlertTitle>No se pudo cargar el mapa</AlertTitle>
            <AlertDescription>
              Ocurrió un error al obtener las zonas y mesas. Intenta de nuevo.
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <Skeleton className='h-[480px] w-full rounded-none' />
        ) : (
          <TableMapCanvas
            ref={canvasRef}
            key={effectiveZoneId}
            tables={zoneTables}
            editing={editing}
            onUpdateTable={handleUpdateTable}
            onSelectTable={(table) => toast.info(`Abrir orden de la mesa ${table.name}`)}
            onEditRequest={setPendingEdit}
            onDeleteRequest={setPendingDelete}
          />
        )}
        {editing && !isError && !isLoading && (
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

      <AddTableSheet
        key={pendingEdit ? `edit-${pendingEdit.id}` : 'create'}
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
        table={pendingEdit}
        zoneId={effectiveZoneId}
      />
      <DeleteTableDialog
        table={pendingDelete}
        onConfirm={(table) => deleteMutation.mutate(table.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
