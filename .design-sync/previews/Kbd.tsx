import { Kbd, KbdGroup } from 'restosync-web';

export const Keys = () => (
  <div className='flex flex-wrap items-center gap-2'>
    <Kbd>⌘</Kbd>
    <Kbd>Enter</Kbd>
    <Kbd>Esc</Kbd>
  </div>
);

export const Combo = () => (
  <div className='flex items-center gap-2 text-sm'>
    Save changes
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>S</Kbd>
    </KbdGroup>
  </div>
);
