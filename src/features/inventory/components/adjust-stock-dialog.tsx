'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { adjustStockMutation } from '../api/mutations';
import type { InventoryItem } from '../api/types';
import {
  ADJUSTMENT_OPTIONS,
  adjustmentFormSchema,
  toAdjustStockDto,
  type AdjustmentFormValues
} from '../schemas/adjustment';

const EMPTY: AdjustmentFormValues = {
  type: 'RESTOCK',
  quantity: undefined as unknown as number,
  reason: ''
};

export function AdjustStockDialog({
  item,
  open,
  onOpenChange
}: {
  item: InventoryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useMutation({
    ...adjustStockMutation,
    onSuccess: () => {
      toast.success(`Stock updated for ${item.name}`);
      onOpenChange(false);
    },
    onError: () => toast.error('Failed to adjust stock')
  });

  const form = useAppForm({
    defaultValues: EMPTY,
    validators: { onSubmit: adjustmentFormSchema },
    onSubmit: ({ value }) => mutation.mutate({ id: item.id, values: toAdjustStockDto(value) })
  });

  const { FormTextField, FormSelectField } = useFormFields<AdjustmentFormValues>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock — {item.name}</DialogTitle>
          <DialogDescription>
            Currently {item.quantityOnHand} {item.unit}. Stock never goes below 0.
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form.Form className='space-y-4'>
            <FormSelectField
              name='type'
              label='Type'
              required
              options={ADJUSTMENT_OPTIONS.map(({ value, label }) => ({
                value,
                label
              }))}
            />
            <FormTextField
              name='quantity'
              label={`Quantity (${item.unit})`}
              required
              type='number'
              step='any'
              placeholder='0'
            />
            <FormTextField
              name='reason'
              label='Reason'
              required
              placeholder='e.g. Weekly delivery, dropped tray…'
            />
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <form.SubmitButton>Save adjustment</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
