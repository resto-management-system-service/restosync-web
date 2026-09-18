import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type { UpdateTableLayoutDto } from '@/api-client';
import {
  createTable,
  createZone,
  deleteTable,
  deleteZone,
  getNextTableName,
  getTables,
  getZones,
  updateTable,
  updateTableLayout,
  updateZone
} from './service';
import type { CreateTableInput, CreateZoneInput, UpdateTableInput, UpdateZoneInput } from './types';

// ============================================================
// Tables Query Key Factory, Query Options & Mutation Options
// ============================================================

export const tablesKeys = {
  all: ['tables'] as const,
  zones: () => [...tablesKeys.all, 'zones'] as const,
  list: () => [...tablesKeys.all, 'list'] as const,
  nextTableName: (zoneId: string) => [...tablesKeys.all, 'next-table-name', zoneId] as const
};

export const zonesQueryOptions = () =>
  queryOptions({
    queryKey: tablesKeys.zones(),
    queryFn: () => getZones(),
    staleTime: 0
  });

export const tablesQueryOptions = () =>
  queryOptions({
    queryKey: tablesKeys.list(),
    queryFn: () => getTables(),
    staleTime: 0
  });

/**
 * Fetch a suggested table name for a zone. A read, fetched on-demand when the
 * add-table sheet opens — not a long-lived cached key that needs invalidation,
 * so the suggestion is freshly computed each time the sheet opens.
 */
export const nextTableNameQueryOptions = (zoneId: string) =>
  queryOptions({
    queryKey: tablesKeys.nextTableName(zoneId),
    queryFn: () => getNextTableName(zoneId),
    staleTime: 0,
    gcTime: 0
  });

const invalidateAll = () => getQueryClient().invalidateQueries({ queryKey: tablesKeys.all });

export const createTableMutation = mutationOptions({
  mutationFn: (input: CreateTableInput) => createTable(input),
  onSettled: invalidateAll
});

export const updateTableLayoutMutation = mutationOptions({
  mutationFn: ({ id, layout }: { id: string; layout: UpdateTableLayoutDto }) =>
    updateTableLayout(id, layout),
  onSettled: invalidateAll
});

export const updateTableMutation = mutationOptions({
  mutationFn: ({ id, input }: { id: string; input: UpdateTableInput }) => updateTable(id, input),
  onSettled: invalidateAll
});

export const deleteTableMutation = mutationOptions({
  mutationFn: (id: string) => deleteTable(id),
  onSettled: invalidateAll
});

export const createZoneMutation = mutationOptions({
  mutationFn: (input: CreateZoneInput) => createZone(input),
  onSettled: invalidateAll
});

export const updateZoneMutation = mutationOptions({
  mutationFn: ({ id, input }: { id: string; input: UpdateZoneInput }) => updateZone(id, input),
  onSettled: invalidateAll
});

export const deleteZoneMutation = mutationOptions({
  mutationFn: (id: string) => deleteZone(id),
  onSettled: invalidateAll
});
