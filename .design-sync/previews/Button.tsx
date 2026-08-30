import { Button } from 'restosync-web';

const Check = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden>
    <path d='M20 6 9 17l-5-5' />
  </svg>
);

export const Variants = () => (
  <div className='flex flex-wrap items-center gap-3'>
    <Button>Save changes</Button>
    <Button variant='secondary'>Secondary</Button>
    <Button variant='outline'>Outline</Button>
    <Button variant='ghost'>Ghost</Button>
    <Button variant='destructive'>Delete</Button>
    <Button variant='link'>Link</Button>
  </div>
);

export const Sizes = () => (
  <div className='flex flex-wrap items-center gap-3'>
    <Button size='sm'>Small</Button>
    <Button size='default'>Default</Button>
    <Button size='lg'>Large</Button>
    <Button size='icon' aria-label='Confirm'>
      <Check />
    </Button>
  </div>
);

export const WithIcon = () => (
  <div className='flex flex-wrap items-center gap-3'>
    <Button>
      <Check />
      Mark as done
    </Button>
    <Button variant='outline'>
      <Check />
      Approve
    </Button>
  </div>
);

export const States = () => (
  <div className='flex flex-wrap items-center gap-3'>
    <Button disabled>Disabled</Button>
    <Button variant='outline' disabled>
      Disabled
    </Button>
    <Button isLoading>Saving</Button>
  </div>
);
