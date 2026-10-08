import * as z from 'zod';
import type { AdjustStockDto, StockAdjustmentType } from '../api/types';

export const ADJUSTMENT_OPTIONS: {
  value: StockAdjustmentType;
  label: string;
  hint: string;
}[] = [
  {
    value: 'RESTOCK',
    label: 'Restock (in)',
    hint: 'Stock received. Adds to the quantity.'
  },
  {
    value: 'SALE',
    label: 'Sale (out)',
    hint: 'Stock sold outside an order. Subtracts.'
  },
  {
    value: 'WASTE',
    label: 'Waste (out)',
    hint: 'Spoiled or lost stock. Subtracts.'
  },
  {
    value: 'CORRECTION',
    label: 'Correction (±)',
    hint: 'Fix a counting error. Use a negative number to reduce.'
  }
];

export const adjustmentFormSchema = z
  .object({
    type: z.enum(['RESTOCK', 'SALE', 'WASTE', 'CORRECTION']),
    quantity: z.number({ message: 'Quantity is required.' }),
    reason: z.string().trim().min(3, 'Please give a reason (at least 3 characters).')
  })
  .superRefine((v, ctx) => {
    if (v.quantity === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Quantity cannot be 0.'
      });
    } else if (v.type !== 'CORRECTION' && v.quantity < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Enter a positive quantity; the type decides the direction.'
      });
    }
  });

export type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>;

/** RESTOCK adds, SALE/WASTE subtract, CORRECTION keeps the sign the user typed. */
export function toAdjustStockDto(v: AdjustmentFormValues): AdjustStockDto {
  const delta =
    v.type === 'RESTOCK' ? v.quantity : v.type === 'CORRECTION' ? v.quantity : -v.quantity;
  return { type: v.type, quantityDelta: delta, reason: v.reason.trim() };
}
