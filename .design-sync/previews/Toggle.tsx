import { Toggle } from 'restosync-web';

const Bold = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden>
    <path d='M6 12h9a4 4 0 0 0 0-8H6v8Zm0 0h10a4 4 0 0 1 0 8H6v-8Z' />
  </svg>
);

export const Variants = () => (
  <div className='flex items-center gap-2'>
    <Toggle aria-label='Bold'>
      <Bold />
    </Toggle>
    <Toggle variant='outline' defaultPressed>
      Featured
    </Toggle>
  </div>
);

export const Sizes = () => (
  <div className='flex items-center gap-2'>
    <Toggle size='sm'>S</Toggle>
    <Toggle size='default'>M</Toggle>
    <Toggle size='lg'>L</Toggle>
  </div>
);

export const States = () => (
  <div className='flex items-center gap-2'>
    <Toggle>Off</Toggle>
    <Toggle defaultPressed>On</Toggle>
    <Toggle disabled>Disabled</Toggle>
  </div>
);
