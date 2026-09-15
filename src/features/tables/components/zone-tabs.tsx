'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Zone } from '../api/types';
import AddZoneInput from './add-zone-input';
import RenameZoneInput from './rename-zone-input';

interface ZoneTabsProps {
  zones: Zone[];
  activeZoneId: string;
  editing: boolean;
  onZoneChange: (zoneId: string) => void;
  onZoneCreated?: (zoneId: string) => void;
  onDeleteZone?: (zone: Zone) => void;
}

export default function ZoneTabs({
  zones,
  activeZoneId,
  editing,
  onZoneChange,
  onZoneCreated,
  onDeleteZone
}: ZoneTabsProps) {
  const [renamingZoneId, setRenamingZoneId] = useState<string | null>(null);

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='bg-muted text-muted-foreground inline-flex h-9 items-center gap-1 rounded-lg p-[3px]'>
        {zones.map((zone) => {
          const isActive = zone.id === activeZoneId;

          if (renamingZoneId === zone.id) {
            return (
              <RenameZoneInput key={zone.id} zone={zone} onDone={() => setRenamingZoneId(null)} />
            );
          }

          return (
            <div key={zone.id} className='inline-flex items-center'>
              <button
                type='button'
                role='tab'
                aria-selected={isActive}
                onClick={() => onZoneChange(zone.id)}
                className={cn(
                  'inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
                  isActive && 'bg-background text-foreground shadow-sm'
                )}
              >
                {zone.name}
              </button>
              {editing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-6'
                      aria-label={`Opciones de ${zone.name}`}
                    >
                      <Icons.ellipsis className='h-3.5 w-3.5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => setRenamingZoneId(zone.id)}>
                      <Icons.edit className='mr-2 h-4 w-4' /> Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteZone?.(zone)}>
                      <Icons.trash className='mr-2 h-4 w-4' /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>
      <AddZoneInput onCreated={onZoneCreated} />
    </div>
  );
}
