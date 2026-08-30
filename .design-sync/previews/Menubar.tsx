import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger
} from 'restosync-web';

export const Open = () => (
  <Menubar defaultValue='menu'>
    <MenubarMenu value='menu'>
      <MenubarTrigger>Menu</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          New item<MenubarShortcut>⌘N</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>Import…</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Publish</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>View</MenubarTrigger>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Help</MenubarTrigger>
    </MenubarMenu>
  </Menubar>
);
