import * as z from 'zod';
import type { CreateTableInput, TableShape, UpdateTableInput } from '../api/types';

export const tableLayoutFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  capacity: z.enum(['2', '4', '6', '8']),
  shape: z.enum(['rounded', 'square', 'circle'])
});

export type TableLayoutFormValues = z.infer<typeof tableLayoutFormSchema>;

export const tableLayoutFormDefaults: TableLayoutFormValues = {
  name: '',
  capacity: '4',
  shape: 'circle'
};

export function toCreateTableInput(v: TableLayoutFormValues, zoneId: string): CreateTableInput {
  return {
    name: v.name,
    capacity: Number(v.capacity),
    shape: v.shape as TableShape,
    zoneId
  };
}

export function toUpdateTableInput(v: TableLayoutFormValues): UpdateTableInput {
  return {
    name: v.name,
    capacity: Number(v.capacity)
  };
}
