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
import { createTableMutation } from '../api/tables.queries';
import {
  tableLayoutFormDefaults,
  tableLayoutFormSchema,
  toCreateTableInput,
  type TableLayoutFormValues
} from '../schemas/table-layout';

const capacityOptions = [
  { value: '2', label: '2 personas' },
  { value: '4', label: '4 personas' },
  { value: '6', label: '6 personas' },
  { value: '8', label: '8 personas' }
];

const shapeOptions = [
  { value: 'round', label: 'Redonda' },
  { value: 'square', label: 'Cuadrada' }
];

interface AddTableSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zoneId: string;
}

export default function AddTableSheet({ open, onOpenChange, zoneId }: AddTableSheetProps) {
  const createMutation = useMutation({
    ...createTableMutation,
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    }
  });

  const form = useAppForm({
    defaultValues: tableLayoutFormDefaults,
    validators: { onSubmit: tableLayoutFormSchema },
    onSubmit: ({ value }) => {
      createMutation.mutate(toCreateTableInput(value, zoneId));
    }
  });

  const { FormTextField, FormSelectField } = useFormFields<TableLayoutFormValues>();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col'>
        <SheetHeader>
          <SheetTitle>Agregar mesa</SheetTitle>
          <SheetDescription>Configura la nueva mesa de esta zona.</SheetDescription>
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
            <FormSelectField name='shape' label='Forma' required options={shapeOptions} />
          </form.Form>
        </form.AppForm>

        <SheetFooter className='pt-4'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='submit' form='add-table-form' isLoading={createMutation.isPending}>
            Agregar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
