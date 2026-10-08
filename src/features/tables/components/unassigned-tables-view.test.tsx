import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Table, Zone } from '../api/types';
import UnassignedTablesView from './unassigned-tables-view';

const zone = (id: string, name: string, code: string): Zone => ({
  id,
  restaurantId: 'r1',
  name,
  code,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

const table = (id: string, name: string, capacity: number, status: Table['status']): Table => ({
  id,
  name,
  capacity,
  status,
  restaurantId: 'r1',
  zoneId: null,
  positionX: null,
  positionY: null,
  width: null,
  height: null,
  shape: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

beforeEach(() => {
  vi.clearAllMocks();
});

it('renders name, capacity, and status for each unassigned table', () => {
  render(
    <UnassignedTablesView
      tables={[table('t9', 'T9', 6, 'AVAILABLE')]}
      zones={[zone('z1', 'Piso 1', '1')]}
      onReassign={() => {}}
      onDelete={() => {}}
    />
  );

  expect(screen.getByText('T9')).toBeInTheDocument();
  expect(screen.getByText('Capacidad 6')).toBeInTheDocument();
  expect(screen.getByText('Libre')).toBeInTheDocument();
});

it('renders the empty state when there are no tables', () => {
  render(<UnassignedTablesView tables={[]} zones={[]} onReassign={() => {}} onDelete={() => {}} />);

  expect(screen.getByText(/no hay mesas sin asignar/i)).toBeInTheDocument();
});

it('calls onDelete for the delete icon and onReassign for the reassign select', async () => {
  const t9 = table('t9', 'T9', 4, 'AVAILABLE');
  const onReassign = vi.fn();
  const onDelete = vi.fn();

  render(
    <UnassignedTablesView
      tables={[t9]}
      zones={[zone('z1', 'Piso 1', '1')]}
      onReassign={onReassign}
      onDelete={onDelete}
    />
  );

  await userEvent.click(screen.getByRole('button', { name: /eliminar t9/i }));
  expect(onDelete).toHaveBeenCalledWith(t9);

  await userEvent.click(screen.getByRole('combobox', { name: /reasignar t9/i }));
  await userEvent.click(await screen.findByRole('option', { name: 'Piso 1' }));
  expect(onReassign).toHaveBeenCalledWith(t9, 'z1');
});
