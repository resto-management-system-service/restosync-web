import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import type { Table, Zone } from '../api/types';
import FloorPlanView from './floor-plan';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() }
}));

import { toast } from 'sonner';

const mocks = vi.hoisted(() => ({
  mountCount: 0,
  getTables: vi.fn(),
  getZones: vi.fn(),
  getNextTableName: vi.fn(),
  updateTableLayout: vi.fn(),
  updateTable: vi.fn(),
  deleteTable: vi.fn(),
  createTable: vi.fn(),
  createZone: vi.fn(),
  updateZone: vi.fn(),
  deleteZone: vi.fn()
}));

vi.mock('../api/service', () => ({
  getTables: mocks.getTables,
  getZones: mocks.getZones,
  getNextTableName: mocks.getNextTableName,
  updateTableLayout: mocks.updateTableLayout,
  updateTable: mocks.updateTable,
  deleteTable: mocks.deleteTable,
  createTable: mocks.createTable,
  createZone: mocks.createZone,
  updateZone: mocks.updateZone,
  deleteZone: mocks.deleteZone
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

vi.mock('./table-map-canvas', async () => {
  const React = await import('react');
  function MockCanvas({
    tables,
    editing,
    selectedTableId,
    onSelectedTableIdChange,
    onDeleteRequest,
    onEditRequest
  }: {
    tables: Array<{ id: string; name: string }>;
    editing: boolean;
    selectedTableId: string | null;
    onSelectedTableIdChange: (id: string | null) => void;
    onDeleteRequest: (table: { id: string; name: string }) => void;
    onEditRequest: (table: { id: string; name: string }) => void;
  }) {
    React.useEffect(() => {
      mocks.mountCount += 1;
    }, []);
    return (
      <div data-testid='canvas'>
        {tables.map((t) => (
          <div key={t.id}>
            <span>{t.name}</span>
            {editing && (
              <button type='button' onClick={() => onSelectedTableIdChange(t.id)}>
                {`select-${t.name}`}
              </button>
            )}
            {editing && selectedTableId === t.id && (
              <>
                <button type='button' onClick={() => onDeleteRequest(t)}>
                  {`eliminar-${t.name}`}
                </button>
                <button type='button' onClick={() => onEditRequest(t)}>
                  {`editar-${t.name}`}
                </button>
              </>
            )}
          </div>
        ))}
        <button type='button' onClick={() => onSelectedTableIdChange(null)}>
          deselect
        </button>
      </div>
    );
  }
  return { default: MockCanvas };
});

const zone = (id: string, name: string, sortOrder: number): Zone => ({
  id,
  restaurantId: 'r1',
  name,
  code: id === 'z1' ? '1' : '2',
  sortOrder,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

const table = (id: string, name: string, zoneId: string | null): Table => ({
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

  vi.clearAllMocks();
  mocks.mountCount = 0;
  mocks.getTables.mockReset().mockImplementation(async () => tables);
  mocks.getZones.mockReset().mockImplementation(async () => zones);
  mocks.getNextTableName.mockReset().mockImplementation(async () => '103');
  mocks.deleteTable.mockReset().mockImplementation(async (id: string) => {
    tables = tables.filter((t) => t.id !== id);
  });
  mocks.updateTableLayout.mockReset().mockResolvedValue({});
  mocks.updateTable.mockReset().mockResolvedValue({});
  mocks.createTable.mockReset();
  mocks.createZone.mockReset();
  mocks.updateZone.mockReset().mockResolvedValue({});
  mocks.deleteZone.mockReset().mockImplementation(async (id: string) => {
    zones = zones.filter((z) => z.id !== id);
  });
});

it('renders only the active zone tables and switches zones', async () => {
  renderView();

  expect(await screen.findByText('T1')).toBeInTheDocument();
  expect(screen.queryByText('T6')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('tab', { name: 'Piso 2' }));

  expect(await screen.findByText('T6')).toBeInTheDocument();
  expect(screen.queryByText('T1')).not.toBeInTheDocument();
});

it('renders the status legend with three badges', () => {
  renderView();

  for (const label of ['Libre', 'Reservada', 'Ocupada']) {
    const el = screen.getByText(label);
    expect(el).toBeInTheDocument();
    expect(el.closest('[data-slot="badge"]')).toBeInTheDocument();
  }
});

it('selects exactly one table at a time and deselects on empty canvas', async () => {
  renderView();
  await screen.findByText('T1');
  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));

  await userEvent.click(screen.getByRole('button', { name: 'select-T1' }));
  expect(screen.getByRole('button', { name: 'eliminar-T1' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'eliminar-T2' })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'select-T2' }));
  expect(screen.getByRole('button', { name: 'eliminar-T2' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'eliminar-T1' })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'deselect' }));
  expect(screen.queryByRole('button', { name: 'eliminar-T1' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'eliminar-T2' })).not.toBeInTheDocument();
});

it('deselects when switching zones', async () => {
  renderView();
  await screen.findByText('T1');
  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'select-T1' }));
  expect(screen.getByRole('button', { name: 'eliminar-T1' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('tab', { name: 'Piso 2' }));
  await screen.findByText('T6');

  expect(screen.queryByRole('button', { name: 'eliminar-T1' })).not.toBeInTheDocument();
});

it('deselects when toggling out of edit mode', async () => {
  renderView();
  await screen.findByText('T1');
  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'select-T1' }));
  expect(screen.getByRole('button', { name: 'eliminar-T1' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /guardar mapa/i }));

  expect(screen.queryByRole('button', { name: 'eliminar-T1' })).not.toBeInTheDocument();
});

it('does not remove a table until the delete is confirmed', async () => {
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'select-T1' }));
  await userEvent.click(await screen.findByRole('button', { name: 'eliminar-T1' }));

  expect(await screen.findByText(/¿Eliminar mesa T1\?/)).toBeInTheDocument();
  expect(screen.getByText('T1')).toBeInTheDocument();
  expect(mocks.deleteTable).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));

  await waitFor(() => expect(screen.queryByText('T1')).not.toBeInTheDocument());
  expect(mocks.deleteTable).toHaveBeenCalledWith('t1');
});

it('opens the edit sheet from the panel and closes on cancel', async () => {
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'select-T1' }));
  await userEvent.click(await screen.findByRole('button', { name: 'editar-T1' }));

  expect(await screen.findByText('Editar mesa')).toBeInTheDocument();
  expect(screen.getByTestId('table-name-readonly')).toHaveTextContent('T1');

  await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
  await waitFor(() => expect(screen.queryByText('Editar mesa')).not.toBeInTheDocument());
  expect(mocks.updateTable).not.toHaveBeenCalled();
});

it('submits an edit via updateTable and closes on success', async () => {
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'select-T1' }));
  await userEvent.click(await screen.findByRole('button', { name: 'editar-T1' }));

  await screen.findByText('Editar mesa');
  // Name is read-only; change capacity (the only editable field).
  await userEvent.click(screen.getByLabelText(/capacidad/i));
  await userEvent.click(await screen.findByRole('option', { name: '8 personas' }));
  await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

  await waitFor(() => expect(screen.queryByText('Editar mesa')).not.toBeInTheDocument());
  expect(mocks.updateTable).toHaveBeenCalledWith('t1', { name: 'T1', capacity: 8 });
});

it('resets the canvas (zoom/pan) when the zone changes', async () => {
  renderView();
  await screen.findByText('T1');
  expect(mocks.mountCount).toBe(1);

  await userEvent.click(screen.getByRole('tab', { name: 'Piso 2' }));
  await screen.findByText('T6');

  expect(mocks.mountCount).toBe(2);
});

it('resizes the canvas container height when dragging the bottom handle, clamped', async () => {
  renderView();
  await screen.findByText('T1');

  const container = screen.getByTestId('canvas-container');
  expect(container).toHaveStyle({ height: '480px' });

  const handle = screen.getByTestId('canvas-resize-handle');
  // jsdom has no PointerEvent, so dispatch MouseEvents with pointer types so
  // `clientY` is honored (fireEvent.pointer* falls back to a generic Event).
  const pointer = (type: string, clientY: number) =>
    fireEvent(handle, new MouseEvent(type, { clientY, bubbles: true, cancelable: true }));

  pointer('pointerdown', 500);
  pointer('pointermove', 700);
  expect(container).toHaveStyle({ height: '680px' });

  // Drag far beyond the max → clamped to MAX_CANVAS_HEIGHT.
  pointer('pointermove', 2000);
  expect(container).toHaveStyle({ height: '750px' });

  // Drag far below the min → clamped to MIN_CANVAS_HEIGHT.
  pointer('pointermove', 0);
  expect(container).toHaveStyle({ height: '300px' });

  pointer('pointerup', 0);
  expect(container).toHaveStyle({ height: '300px' });
});

it('renames a zone via the dropdown (pre-filled, calls updateZone)', async () => {
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'Opciones de Piso 1' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: /renombrar/i }));

  const input = await screen.findByLabelText(/nuevo nombre/i);
  expect(input).toHaveValue('Piso 1');

  await userEvent.clear(input);
  await userEvent.type(input, 'Planta Baja');
  await userEvent.click(screen.getByRole('button', { name: /guardar nombre/i }));

  await waitFor(() => expect(mocks.updateZone).toHaveBeenCalledWith('z1', { name: 'Planta Baja' }));
});

it('deletes a zone only after confirmation', async () => {
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'Opciones de Piso 1' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: /eliminar/i }));

  expect(await screen.findByText(/¿Eliminar la zona Piso 1\?/)).toBeInTheDocument();
  expect(mocks.deleteZone).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));

  await waitFor(() => expect(mocks.deleteZone).toHaveBeenCalledWith('z1'));
});

it('surfaces the 400 rejection message when deleting a zone with busy tables', async () => {
  mocks.deleteZone.mockRejectedValue(
    new Error('Cannot delete a zone that has reserved or occupied tables')
  );
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'Opciones de Piso 1' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: /eliminar/i }));
  await userEvent.click(await screen.findByRole('button', { name: /^eliminar$/i }));

  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      'Cannot delete a zone that has reserved or occupied tables'
    )
  );
});

it('switches to the first remaining zone after deleting the active zone', async () => {
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('button', { name: /editar mapa/i }));
  await userEvent.click(screen.getByRole('button', { name: 'Opciones de Piso 1' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: /eliminar/i }));
  await userEvent.click(await screen.findByRole('button', { name: /^eliminar$/i }));

  await waitFor(() => expect(mocks.deleteZone).toHaveBeenCalledWith('z1'));
  await waitFor(() => expect(screen.getByText('T6')).toBeInTheDocument());
});

it('hides the unassigned tab when no tables are unassigned', async () => {
  renderView();
  await screen.findByText('T1');

  expect(screen.queryByRole('tab', { name: /sin asignar/i })).not.toBeInTheDocument();
});

it('shows the unassigned tab and lists unassigned tables when selected', async () => {
  tables = [table('t1', 'T1', 'z1'), table('t9', 'T9', null)];
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('tab', { name: /sin asignar/i }));

  expect(await screen.findByText('T9')).toBeInTheDocument();
  expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
});

it('reassigns an unassigned table to a target zone', async () => {
  tables = [table('t1', 'T1', 'z1'), table('t9', 'T9', null)];
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('tab', { name: /sin asignar/i }));
  await screen.findByText('T9');

  await userEvent.click(screen.getByRole('combobox', { name: /reasignar t9/i }));
  await userEvent.click(await screen.findByRole('option', { name: 'Piso 1' }));

  await waitFor(() =>
    expect(mocks.updateTableLayout).toHaveBeenCalledWith(
      't9',
      expect.objectContaining({
        zoneId: 'z1',
        positionX: expect.any(Number),
        positionY: expect.any(Number)
      })
    )
  );
});

it('deletes a table from the unassigned view via confirmation', async () => {
  tables = [table('t1', 'T1', 'z1'), table('t9', 'T9', null)];
  renderView();
  await screen.findByText('T1');

  await userEvent.click(screen.getByRole('tab', { name: /sin asignar/i }));
  await screen.findByText('T9');

  await userEvent.click(screen.getByRole('button', { name: /eliminar t9/i }));

  expect(await screen.findByText(/¿Eliminar mesa T9\?/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));

  await waitFor(() => expect(mocks.deleteTable).toHaveBeenCalledWith('t9'));
});
