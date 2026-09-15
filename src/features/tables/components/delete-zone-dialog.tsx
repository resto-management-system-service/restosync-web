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
import type { Zone } from '../api/types';

interface DeleteZoneDialogProps {
  zone: Zone | null;
  onConfirm: (zone: Zone) => void;
  onCancel: () => void;
}

export default function DeleteZoneDialog({ zone, onConfirm, onCancel }: DeleteZoneDialogProps) {
  return (
    <AlertDialog
      open={!!zone}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar zona</AlertDialogTitle>
          <AlertDialogDescription>
            {zone ? `¿Eliminar la zona ${zone.name}? Esta acción no se puede deshacer.` : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={() => zone && onConfirm(zone)}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
