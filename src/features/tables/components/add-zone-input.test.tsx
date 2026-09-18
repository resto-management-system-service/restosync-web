import { beforeEach, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import type { Zone } from '../api/types';
import { createZone } from '../api/service';
import AddZoneInput from './add-zone-input';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() }
}));

import { toast } from 'sonner';

vi.mock('../api/service', () => ({
  createZone: vi.fn()
}));

const zone = (id: string, code: string): Zone => ({
  id,
  restaurantId: 'r1',
  name: id,
  code,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

beforeEach(() => {
  vi.clearAllMocks();
});

it('pre-fills the next code suggestion read-only (reusing gaps) and keeps name editable', async () => {
  const onCreated = vi.fn();
  vi.mocked(createZone).mockResolvedValue(zone('z-new', '2'));

  renderWithProviders(
    <AddZoneInput zones={[zone('z1', '1'), zone('z2', '3')]} onCreated={onCreated} />
  );

  await userEvent.click(screen.getByRole('button', { name: /agregar zona/i }));

  // Code is shown read-only — no editable input for it.
  expect(screen.getByTestId('zone-code-readonly')).toHaveTextContent('2');
  expect(screen.queryByLabelText(/código de la zona/i)).not.toBeInTheDocument();

  await userEvent.type(screen.getByLabelText(/nombre de la zona/i), 'Terraza');
  await userEvent.click(screen.getByRole('button', { name: /guardar zona/i }));

  await waitFor(() => expect(createZone).toHaveBeenCalledWith({ name: 'Terraza', code: '2' }));
});

it('suggests "1" for a restaurant with no numeric zone codes', async () => {
  renderWithProviders(<AddZoneInput zones={[zone('z1', 'VIP')]} />);

  await userEvent.click(screen.getByRole('button', { name: /agregar zona/i }));

  expect(screen.getByTestId('zone-code-readonly')).toHaveTextContent('1');
});

it('surfaces the backend duplicate-code message via toast', async () => {
  vi.mocked(createZone).mockRejectedValue(new Error('Zone code "2" already exists'));

  renderWithProviders(<AddZoneInput zones={[zone('z1', '1'), zone('z2', '3')]} />);

  await userEvent.click(screen.getByRole('button', { name: /agregar zona/i }));
  await userEvent.type(screen.getByLabelText(/nombre de la zona/i), 'Piso 2');
  await userEvent.click(screen.getByRole('button', { name: /guardar zona/i }));

  await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Zone code "2" already exists'));
});
