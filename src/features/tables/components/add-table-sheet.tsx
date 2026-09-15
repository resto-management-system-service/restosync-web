'use client';

import { useMutation } from '@tanstack/react-query';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import * as z from 'zod';
import type { Table } from '../api/types';
import { createTableMutation, updateTableMutation } from '../api/tables.queries';
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
    }
  });

  const updateMutation = useMutation({
    ...updateTableMutation,
    onSuccess: () => {
      onOpenChange(false);
    }
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

  const { FormTextField, FormSelectField } = useFormFields<TableLayoutFormValues>();

  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar mesa' : 'Agregar mesa'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Actualiza el nombre y la capacidad de la mesa.'
              : 'Configura la nueva mesa de esta zona.'}
          </SheetDescription>
        </SheetHeader>

        <form.AppForm>
          <form.Form id='add-table-form' className='space-y-4 p-0 md:p-0'>
            <FormTextField
              name='name'
              label='Nombre'
              required
              placeholder='e.g. T14'
              validators={{ onBlur: z.string().min(1, 'El nombre es requerido.') }}
            />
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
