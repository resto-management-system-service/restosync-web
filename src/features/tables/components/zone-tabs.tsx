'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Zone } from '../api/types';
import AddZoneInput from './add-zone-input';

interface ZoneTabsProps {
  zones: Zone[];
  activeZoneId: string;
  onZoneChange: (zoneId: string) => void;
  onZoneCreated?: (zoneId: string) => void;
}

export default function ZoneTabs({
  zones,
  activeZoneId,
  onZoneChange,
  onZoneCreated
}: ZoneTabsProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Tabs value={activeZoneId} onValueChange={onZoneChange}>
        <TabsList>
          {zones.map((zone) => (
            <TabsTrigger key={zone.id} value={zone.id}>
              {zone.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <AddZoneInput onCreated={onZoneCreated} />
    </div>
  );
}
