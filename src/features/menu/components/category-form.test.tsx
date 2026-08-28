import { beforeEach, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { db, resetDb } from '@/mocks/db';
import { renderWithProviders } from '@/test/utils';
import { routerMock } from '../../../../vitest.setup';
import CategoryForm from './category-form';

beforeEach(() => resetDb());

it('validates a short name', async () => {
  renderWithProviders(<CategoryForm pageTitle='New Category' />);
  await userEvent.type(screen.getByLabelText(/name/i), 'a');
  await userEvent.click(screen.getByRole('button', { name: /add category/i }));
  expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
});

it('creates a category', async () => {
  const before = db.categories.length;
  renderWithProviders(<CategoryForm pageTitle='New Category' />);
  await userEvent.type(screen.getByLabelText(/name/i), 'Seasonal');
  await userEvent.click(screen.getByRole('button', { name: /add category/i }));
  await waitFor(() => expect(db.categories.length).toBe(before + 1));
  await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/dashboard/menu/categories'));
});
