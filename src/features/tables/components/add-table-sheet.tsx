'use client';

import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import type { Table } from '../api/types';
import {
  createTableMutation,
  nextTableNameQueryOptions,
  updateTableMutation
} from '../api/tables.queries';
import {
  tableLayoutFormDefaults,
  tableLayoutFormSchema,
  toCreateTableInput,
  toUpdateTableInput,
  type TableLayoutFormValues
} from '../schemas/table-layout';

const capacityOptions = [
  { value: '2', label: '2 personas' },
  { value: '4', label: '4 personas' },
  { value: '6', label: '6 personas' },
  { value: '8', label: '8 personas' }
];

const shapeOptions = [
  { value: 'circle', label: 'Círculo' },
  { value: 'rounded', label: 'Redondeada' },
  { value: 'square', label: 'Cuadrada' }
];

interface AddTableSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null → create a new table; a Table → edit that table's name/capacity. */
  table: Table | null;
  zoneId: string;
}

export default function AddTableSheet({ open, onOpenChange, table, zoneId }: AddTableSheetProps) {
  const isEdit = table !== null;

  const defaultValues: TableLayoutFormValues = isEdit
    ? {
        name: table.name,
        capacity: String(table.capacity ?? 4) as TableLayoutFormValues['capacity'],
        shape: table.shape ?? 'circle'
      }
    : tableLayoutFormDefaults;

  const createMutation = useMutation({
    ...createTableMutation,
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    ...updateTableMutation,
    onSuccess: () => {
      onOpenChange(false);
    },
    onError: (error) => toast.error(error.message)
  });

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: tableLayoutFormSchema },
    onSubmit: ({ value }) => {
      if (isEdit && table) {
        updateMutation.mutate({ id: table.id, input: toUpdateTableInput(value) });
      } else {
        createMutation.mutate(toCreateTableInput(value, zoneId));
      }
    }
  });

  // Fetch a suggested name on-demand when the create sheet opens. gcTime: 0 +
  // staleTime: 0 means the suggestion is freshly computed each time it opens.
  const nextNameQuery = useQuery({
    ...nextTableNameQueryOptions(zoneId),
    enabled: open && !isEdit && !!zoneId
  });

  // Start from a clean form each time the create sheet opens.
  useEffect(() => {
    if (open && !isEdit) form.reset();
  }, [open, isEdit, form]);

  // Pre-fill the suggested name once it arrives (still fully editable).
  useEffect(() => {
    if (open && !isEdit && nextNameQuery.data) {
      form.setFieldValue('name', nextNameQuery.data);
    }
  }, [open, isEdit, nextNameQuery.data, form]);

  const { FormSelectField } = useFormFields<TableLayoutFormValues>();

  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  // The table name is always server-assigned — shown read-only, never editable.
  const displayName = isEdit ? table.name : (nextNameQuery.data ?? '');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar mesa' : 'Agregar mesa'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Actualiza la capacidad de la mesa.'
              : 'Configura la nueva mesa de esta zona.'}
          </SheetDescription>
        </SheetHeader>

        <form.AppForm>
          <form.Form id='add-table-form' className='space-y-4 p-0 md:p-0'>
            <div className='space-y-1.5'>
              <Label>Nombre</Label>
              <div
                data-testid='table-name-readonly'
                className='flex h-9 w-full items-center justify-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-muted-foreground'
              >
                {displayName}
              </div>
              <p className='text-xs text-muted-foreground'>Asignado automáticamente.</p>
            </div>
            <FormSelectField name='capacity' label='Capacidad' required options={capacityOptions} />
            {!isEdit && (
              <FormSelectField name='shape' label='Forma' required options={shapeOptions} />
            )}
          </form.Form>
        </form.AppForm>

        <SheetFooter className='pt-4'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='add-table-form' isLoading={isPending}>
            {isEdit ? 'Guardar cambios' : 'Agregar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
