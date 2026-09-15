import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type { Table, Zone } from '../api/types';
import FloorPlanView from './floor-plan';

const mocks = vi.hoisted(() => ({
  getTables: vi.fn(),
  getZones: vi.fn(),
  updateTableLayout: vi.fn(),
  deleteTable: vi.fn(),
  createTable: vi.fn(),
  createZone: vi.fn()
}));

vi.mock('../api/service', () => ({
  getTables: mocks.getTables,
  getZones: mocks.getZones,
  updateTableLayout: mocks.updateTableLayout,
  deleteTable: mocks.deleteTable,
  createTable: mocks.createTable,
  createZone: mocks.createZone
}));

vi.mock('next/dynamic', async () => {
  const React = await import('react');
  return {
    default: (loader: () => Promise<{ default: React.ComponentType<unknown> }>) => {
      return function DynamicComponent(props: Record<string, unknown>) {
        const [Component, setComponent] = React.useState<React.ComponentType<unknown> | null>(null);
        React.useEffect(() => {
          void loader().then((mod) => setComponent(() => mod.default));
        }, []);
        return Component ? React.createElement(Component, props) : null;
      };
    }
  };
});

vi.mock('./table-map-canvas', () => ({
  default: ({
    tables,
    editing,
    onDeleteRequest
  }: {
    tables: Array<{ id: string; name: string }>;
    editing: boolean;
    onDeleteRequest: (table: { id: string; name: string }) => void;
  }) => (
    <div data-testid='canvas'>
      {tables.map((t) => (
        <div key={t.id}>
          <span>{t.name}</span>
          {editing && (
            <button type='button' onClick={() => onDeleteRequest(t)}>
              {`eliminar-${t.name}`}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}));

const zone = (id: string, name: string, sortOrder: number): Zone => ({
  id,
  restaurantId: 'r1',
  name,
  sortOrder,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

const table = (id: string, name: string, zoneId: string): Table => ({
  id,
  name,
  capacity: 4,
  status: 'AVAILABLE',
  restaurantId: 'r1',
  zoneId,
  positionX: 0.2,
  positionY: 0.2,
  width: 0.16,
  height: 0.16,
  shape: 'circle',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

let zones: Zone[];
let tables: Table[];

function renderView() {
  const queryClient = getQueryClient();
  queryClient.clear();
  return render(
    <QueryClientProvider client={queryClient}>
      <FloorPlanView />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  zones = [zone('z1', 'Piso 1', 0), zone('z2', 'Piso 2', 1)];
  tables = [table('t1', 'T1', 'z1'), table('t2', 'T2', 'z1'), table('t6', 'T6', 'z2')];

  mocks.getTables.mockReset().mockImplementation(async () => tables);
  mocks.getZones.mockReset().mockImplementation(async () => zones);
  mocks.deleteTable.mockReset().mockImplementation(async (id: string) => {
    tables = tables.filter((t) => t.id !== id);
  });
  mocks.updateTableLayout.mockReset().mockResolvedValue({});
  mocks.createTable.mockReset();
  mocks.createZone.mockReset();
});

it('renders only the active zone tables and switches zones', async () => {
  renderView();

  expect(await screen.findByText('T1')).toBeInTheDocument();
  expect(screen.queryByText('T6')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('tab', { name: 'Piso 2' }));

  expect(await screen.findByText('T6')).toBeInTheDocument();
  expect(screen.queryByText('T1')).not.toBeInTheDocument();
});

it('does not remove a table until the delete is confirmed', async () => {
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(await screen.findByRole('button', { name: 'eliminar-T1' }));

  expect(await screen.findByText(/¿Eliminar mesa T1\?/)).toBeInTheDocument();
  expect(screen.getByText('T1')).toBeInTheDocument();
  expect(mocks.deleteTable).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));

  await waitFor(() => expect(screen.queryByText('T1')).not.toBeInTheDocument());
  expect(mocks.deleteTable).toHaveBeenCalledWith('t1');
});
