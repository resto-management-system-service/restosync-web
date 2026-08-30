import { Badge } from 'restosync-web';

const Dot = () => (
  <svg viewBox='0 0 8 8' aria-hidden>
    <circle cx='4' cy='4' r='4' fill='currentColor' />
  </svg>
);

export const Variants = () => (
  <div className='flex flex-wrap items-center gap-2'>
    <Badge>Available</Badge>
    <Badge variant='secondary'>Draft</Badge>
    <Badge variant='destructive'>86'd</Badge>
    <Badge variant='outline'>Archived</Badge>
  </div>
);

export const WithIcon = () => (
  <div className='flex flex-wrap items-center gap-2'>
    <Badge variant='secondary'>
      <Dot />
      Live
    </Badge>
    <Badge variant='outline'>
      <Dot />
      Paused
    </Badge>
  </div>
);

export const Counts = () => (
  <div className='flex flex-wrap items-center gap-2'>
    <Badge>3 new</Badge>
    <Badge variant='secondary'>12</Badge>
    <Badge variant='destructive'>99+</Badge>
  </div>
);
