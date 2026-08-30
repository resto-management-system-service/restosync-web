import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from 'restosync-web';

export const Open = () => (
  <DropdownMenu defaultOpen>
    <DropdownMenuTrigger asChild>
      <Button variant='outline'>Actions</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align='start' className='w-48'>
      <DropdownMenuLabel>Menu item</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        Edit<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>Duplicate</DropdownMenuItem>
      <DropdownMenuItem>Move to category…</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
