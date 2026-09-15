import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type { UpdateTableLayoutDto } from '@/api-client';
import {
  createTable,
  createZone,
  deleteTable,
  getTables,
  getZones,
  updateTableLayout
} from './service';
import type { CreateTableInput } from './types';

// ============================================================
// Tables Query Key Factory, Query Options & Mutation Options
// ============================================================

export const tablesKeys = {
  all: ['tables'] as const,
  zones: () => [...tablesKeys.all, 'zones'] as const,
  list: () => [...tablesKeys.all, 'list'] as const
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

export const deleteTableMutation = mutationOptions({
  mutationFn: (id: string) => deleteTable(id),
  onSettled: invalidateAll
});

export const createZoneMutation = mutationOptions({
  mutationFn: (name: string) => createZone(name),
  onSettled: invalidateAll
});
