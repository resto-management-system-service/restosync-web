import { inventoryHandlers } from './inventory';
import { menuCategoriesHandlers } from './menu-categories';
import { menuItemsHandlers } from './menu-items';

export const handlers = [...menuCategoriesHandlers, ...menuItemsHandlers, ...inventoryHandlers];
