import * as z from 'zod';
import type { CreateTableInput, TableCapacity, TableShape } from '../api/mock-data';

export const tableLayoutFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  capacity: z.enum(['2', '4', '6', '8']),
  shape: z.enum(['round', 'square'])
});

export type TableLayoutFormValues = z.infer<typeof tableLayoutFormSchema>;

export const tableLayoutFormDefaults: TableLayoutFormValues = {
  name: '',
  capacity: '4',
  shape: 'round'
};

export function toCreateTableInput(v: TableLayoutFormValues, zoneId: string): CreateTableInput {
  return {
    name: v.name,
    capacity: Number(v.capacity) as TableCapacity,
    shape: v.shape as TableShape,
    zoneId
  };
}
