import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createTable,
  createZone,
  deleteTable,
  getTablesByZone,
  getZones,
  updateTableLayout,
  type CreateTableInput,
  type TableLayoutUpdate
} from './mock-data';

// ============================================================
// Tables Query Key Factory, Query Options & Mutation Options
// ============================================================
// These wrap the in-memory mock functions. When the real API exists, only
// `mock-data.ts` needs to change — these hooks keep the same shape.

export const tablesKeys = {
  all: ['tables'] as const,
  zones: () => [...tablesKeys.all, 'zones'] as const,
  byZone: (zoneId: string) => [...tablesKeys.all, 'zone', zoneId] as const
};

export const zonesQueryOptions = () =>
  queryOptions({
    queryKey: tablesKeys.zones(),
    queryFn: () => getZones()
  });

export const tablesByZoneQueryOptions = (zoneId: string) =>
  queryOptions({
    queryKey: tablesKeys.byZone(zoneId),
    queryFn: () => getTablesByZone(zoneId),
    enabled: !!zoneId
  });

const invalidateAll = () => getQueryClient().invalidateQueries({ queryKey: tablesKeys.all });

export const createTableMutation = mutationOptions({
  mutationFn: (input: CreateTableInput) => createTable(input),
  onSettled: invalidateAll
});

export const updateTableLayoutMutation = mutationOptions({
  mutationFn: ({ id, layout }: { id: string; layout: TableLayoutUpdate }) =>
    updateTableLayout(id, layout),
  onSettled: invalidateAll
});

export const deleteTableMutation = mutationOptions({
  mutationFn: (id: string) => deleteTable(id),
  onSettled: invalidateAll
});

export const createZoneMutation = mutationOptions({
  mutationFn: (name: string) => createZone(name),
  onSettled: invalidateAll
});
