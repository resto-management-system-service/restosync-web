'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import type { TableLayout } from '../api/mock-data';

interface DeleteTableDialogProps {
  table: TableLayout | null;
  onConfirm: (table: TableLayout) => void;
  onCancel: () => void;
}

export default function DeleteTableDialog({ table, onConfirm, onCancel }: DeleteTableDialogProps) {
  return (
    <AlertDialog
      open={!!table}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar mesa</AlertDialogTitle>
          <AlertDialogDescription>
            {table ? `¿Eliminar mesa ${table.name}? Esta acción no se puede deshacer.` : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={() => table && onConfirm(table)}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
