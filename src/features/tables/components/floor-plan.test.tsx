import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { resetTableData } from '../api/mock-data';
import FloorPlanView from './floor-plan';

function renderView() {
  const queryClient = getQueryClient();
  queryClient.clear();
  return render(
    <QueryClientProvider client={queryClient}>
      <FloorPlanView />
    </QueryClientProvider>
  );
}

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

beforeEach(() => resetTableData());

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

  await userEvent.click(screen.getByRole('button', { name: /^eliminar$/i }));

  await waitFor(() => expect(screen.queryByText('T1')).not.toBeInTheDocument());
});
