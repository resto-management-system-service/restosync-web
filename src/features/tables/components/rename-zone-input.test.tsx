import { beforeEach, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import type { Zone } from '../api/types';
import { updateZone } from '../api/service';
import RenameZoneInput from './rename-zone-input';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() }
}));

vi.mock('../api/service', () => ({
  updateZone: vi.fn()
}));

const zone: Zone = {
  id: 'z1',
  restaurantId: 'r1',
  name: 'Piso 1',
  code: '1',
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

beforeEach(() => {
  vi.clearAllMocks();
});

it('keeps the name editable and does not show the internal code', () => {
  renderWithProviders(<RenameZoneInput zone={zone} onDone={() => {}} />);

  const nameInput = screen.getByLabelText(/nuevo nombre/i);
  expect(nameInput).toHaveValue('Piso 1');
  expect(screen.queryByTestId('zone-code-readonly')).not.toBeInTheDocument();
});

it('renames the zone sending only the full name (no auto-combine)', async () => {
  const onDone = vi.fn();
  vi.mocked(updateZone).mockResolvedValue(zone);

  renderWithProviders(<RenameZoneInput zone={zone} onDone={onDone} />);

  const nameInput = screen.getByLabelText(/nuevo nombre/i);
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, 'Planta Baja');
  await userEvent.click(screen.getByRole('button', { name: /guardar nombre/i }));

  await waitFor(() => expect(updateZone).toHaveBeenCalledWith('z1', { name: 'Planta Baja' }));
});
