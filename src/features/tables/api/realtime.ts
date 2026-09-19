'use client';

import type { QueryClient } from '@tanstack/react-query';
import { useRealtimeEvent } from '@/hooks/use-realtime-event';
import { getQueryClient } from '@/lib/query-client';
import { tablesKeys } from './tables.queries';
import type { Table, TableStatus } from './types';

/**
 * Payload of the backend's `table.status_changed` event. The backend emits it
 * to the `staff:${restaurantId}` room only, so the socket already receives
 * events scoped to the authenticated restaurant.
 */
export interface TableStatusChangedPayload {
  tableId: string;
  restaurantId: string;
  status: TableStatus;
  zoneId: string | null;
}

/**
 * Patch the matching table's `status` directly in the cached tables list, so
 * the floor plan reflects a live status change instantly (no network refetch).
 *
 * Applies to the WHOLE list — not the active-zone slice — so the update is
 * correct whenever the user switches to the affected zone's tab.
 */
export function applyTableStatusChange(
  queryClient: QueryClient,
  payload: TableStatusChangedPayload
): void {
  queryClient.setQueryData<Table[]>(tablesKeys.list(), (old) =>
    (old ?? []).map((t) => (t.id === payload.tableId ? { ...t, status: payload.status } : t))
  );
}

/**
 * Subscribe the current component to `table.status_changed` and keep the
 * tables query cache in sync. Wire once at the top of the floor plan view so
 * the subscription lives for the whole screen rather than per-table.
 */
export function useTableStatusRealtime(): void {
  useRealtimeEvent<TableStatusChangedPayload>('table.status_changed', (payload) => {
    applyTableStatusChange(getQueryClient(), payload);
  });
}
