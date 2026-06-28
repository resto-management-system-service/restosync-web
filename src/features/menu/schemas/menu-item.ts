import * as z from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  price: z.number({ message: 'Price is required.' }).positive('Price must be greater than 0.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  available: z.boolean()
});

export type MenuItemFormValues = {
  name: string;
  category: string;
  price: number | undefined;
  description: string;
  available: boolean;
};
