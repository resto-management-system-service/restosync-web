'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { createZoneMutation } from '../api/tables.queries';
import { suggestNextZoneCode } from '../lib/naming';
import type { Zone } from '../api/types';

interface AddZoneInputProps {
  zones: Zone[];
  onCreated?: (zoneId: string) => void;
}

export default function AddZoneInput({ zones, onCreated }: AddZoneInputProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) nameInputRef.current?.focus();
  }, [adding]);

  const mutation = useMutation({
    ...createZoneMutation,
    onSuccess: (zone) => {
      setName('');
      setCode('');
      setAdding(false);
      onCreated?.(zone.id);
    },
    onError: (error) => toast.error(error.message)
  });

  const startAdding = () => {
    setCode(suggestNextZoneCode(zones));
    setAdding(true);
  };

  if (!adding) {
    return (
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='size-9'
        aria-label='Agregar zona'
        onClick={startAdding}
      >
        <Icons.add className='h-4 w-4' />
      </Button>
    );
  }

  const submit = () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode) return;
    mutation.mutate({ name: trimmedName, code: trimmedCode });
  };

  const cancel = () => {
    setName('');
    setCode('');
    setAdding(false);
  };

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-2'>
        <Input
          ref={nameInputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') cancel();
          }}
          placeholder='Nombre de la zona'
          aria-label='Nombre de la zona'
          className='h-9 w-40'
        />
        <div
          data-testid='zone-code-readonly'
          className='flex h-9 w-20 items-center justify-center rounded-md border border-input bg-muted px-2 text-sm font-medium text-muted-foreground'
        >
          {code}
        </div>
        <Button
          type='button'
          size='icon'
          className='size-9'
          isLoading={mutation.isPending}
          onClick={submit}
          aria-label='Guardar zona'
        >
          <Icons.check className='h-4 w-4' />
        </Button>
      </div>
      <p className='text-xs text-muted-foreground'>
        El código se asigna automático — no se puede editar.
      </p>
    </div>
  );
}
