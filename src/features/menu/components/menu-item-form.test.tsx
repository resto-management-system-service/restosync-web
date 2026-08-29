import { beforeEach, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { db, resetDb } from '@/mocks/db';
import { renderWithProviders } from '@/test/utils';
import { routerMock } from '../../../../vitest.setup';
import type { MenuItemFormValues } from '../schemas/menu-item';
import MenuItemForm from './menu-item-form';

beforeEach(() => resetDb());

it('shows a validation error on empty submit', async () => {
  renderWithProviders(<MenuItemForm pageTitle='New Item' />);
  await userEvent.click(await screen.findByRole('button', { name: /add item/i }));
  expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
});

it('creates an item, converting dollars to integer cents', async () => {
  const categoryId = db.categories[0].id;
  const before = db.items.length;

  const initialValues: MenuItemFormValues = {
    name: '',
    description: '',
    priceDollars: undefined as unknown as number,
    currency: 'USD',
    imageUrl: '',
    available: true,
    categoryId
  };

  renderWithProviders(<MenuItemForm pageTitle='New Item' initialValues={initialValues} />);

  await userEvent.type(await screen.findByLabelText(/item name/i), 'Garlic Bread');
  await userEvent.type(screen.getByLabelText(/price/i), '5.25');
  await userEvent.click(screen.getByRole('button', { name: /add item/i }));

  await waitFor(() => expect(db.items.length).toBe(before + 1));
  const created = db.items.find((i) => i.name === 'Garlic Bread');
  expect(created?.priceCents).toBe(525);
  expect(created?.categoryId).toBe(categoryId);
  await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/dashboard/menu/items'));
});
