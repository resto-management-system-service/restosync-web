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

it('shows the code read-only and keeps the name editable', () => {
  renderWithProviders(<RenameZoneInput zone={zone} onDone={() => {}} />);

  expect(screen.getByTestId('zone-code-readonly')).toHaveTextContent('1');
  expect(screen.queryByLabelText(/código de la zona/i)).not.toBeInTheDocument();

  const nameInput = screen.getByLabelText(/nuevo nombre/i);
  expect(nameInput).toHaveValue('Piso 1');
});

it('renames the zone sending only the name (code untouched)', async () => {
  const onDone = vi.fn();
  vi.mocked(updateZone).mockResolvedValue(zone);

  renderWithProviders(<RenameZoneInput zone={zone} onDone={onDone} />);

  const nameInput = screen.getByLabelText(/nuevo nombre/i);
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, 'Planta Baja');
  await userEvent.click(screen.getByRole('button', { name: /guardar nombre/i }));

  await waitFor(() => expect(updateZone).toHaveBeenCalledWith('z1', { name: 'Planta Baja' }));
});
