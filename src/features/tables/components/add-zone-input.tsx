'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { createZoneMutation } from '../api/tables.queries';

interface AddZoneInputProps {
  onCreated?: (zoneId: string) => void;
}

export default function AddZoneInput({ onCreated }: AddZoneInputProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const mutation = useMutation({
    ...createZoneMutation,
    onSuccess: (zone) => {
      setName('');
      setAdding(false);
      onCreated?.(zone.id);
    }
  });

  if (!adding) {
    return (
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='size-9'
        aria-label='Agregar zona'
        onClick={() => setAdding(true)}
      >
        <Icons.add className='h-4 w-4' />
      </Button>
    );
  }

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    mutation.mutate(trimmed);
  };

  return (
    <div className='flex items-center gap-2'>
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') {
            setName('');
            setAdding(false);
          }
        }}
        placeholder='Nombre de la zona'
        className='h-9 w-40'
      />
      <Button
        type='button'
        size='icon'
        className='size-9'
        isLoading={mutation.isPending}
        onClick={submit}
      >
        <Icons.check className='h-4 w-4' />
      </Button>
    </div>
  );
}
