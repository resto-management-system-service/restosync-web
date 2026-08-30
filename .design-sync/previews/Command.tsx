import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from 'restosync-web';

export const Palette = () => (
  <Command className='max-w-sm rounded-lg border shadow-md'>
    <CommandInput placeholder='Search actions…' />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading='Menu'>
        <CommandItem>
          New item<CommandShortcut>⌘N</CommandShortcut>
        </CommandItem>
        <CommandItem>New category</CommandItem>
        <CommandItem>Import from CSV</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading='Navigation'>
        <CommandItem>Go to orders</CommandItem>
        <CommandItem>Go to reports</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);
