import { beforeEach, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { db, resetDb } from '@/mocks/db';
import { renderWithProviders } from '@/test/utils';
import { CellAction } from './cell-action';

beforeEach(() => resetDb());

it('deletes the row after confirming', async () => {
  const target = db.items[0];
  const before = db.items.length;
  renderWithProviders(<CellAction data={target} />);

  await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
  await userEvent.click(await screen.findByText(/delete/i));
  await userEvent.click(await screen.findByRole('button', { name: /continue/i }));

  await waitFor(() => expect(db.items.length).toBe(before - 1));
  expect(db.items.find((i) => i.id === target.id)).toBeUndefined();
});
