import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from 'restosync-web';

export const Open = () => (
  <NavigationMenu defaultValue='menu'>
    <NavigationMenuList>
      <NavigationMenuItem value='menu'>
        <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className='grid w-64 gap-1 p-2 text-sm'>
            <NavigationMenuLink>Items</NavigationMenuLink>
            <NavigationMenuLink>Categories</NavigationMenuLink>
            <NavigationMenuLink>Modifiers</NavigationMenuLink>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink>Orders</NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);
