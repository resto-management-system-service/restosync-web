'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { updateZoneMutation } from '../api/tables.queries';
import type { Zone } from '../api/types';

interface RenameZoneInputProps {
  zone: Zone;
  onDone: () => void;
}

export default function RenameZoneInput({ zone, onDone }: RenameZoneInputProps) {
  const [name, setName] = useState(zone.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const mutation = useMutation({
    ...updateZoneMutation,
    onSuccess: () => {
      toast.success('Zona renombrada');
      onDone();
    },
    onError: (error) => toast.error(error.message)
  });

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === zone.name) {
      onDone();
      return;
    }
    mutation.mutate({ id: zone.id, input: { name: trimmed } });
  };

  return (
    <div className='flex flex-col gap-1 px-1'>
      <div className='flex items-center gap-1'>
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') onDone();
          }}
          aria-label='Nuevo nombre de la zona'
          className='h-7 w-28'
        />
        <div
          data-testid='zone-code-readonly'
          className='flex h-7 w-10 items-center justify-center rounded border border-input bg-muted text-xs font-medium text-muted-foreground'
        >
          {zone.code}
        </div>
        <Button
          type='button'
          size='icon'
          className='size-7'
          isLoading={mutation.isPending}
          onClick={submit}
          aria-label='Guardar nombre'
        >
          <Icons.check className='h-3.5 w-3.5' />
        </Button>
      </div>
      <p className='text-xs text-muted-foreground'>
        El código se asigna automático — no se puede editar.
      </p>
    </div>
  );
}
