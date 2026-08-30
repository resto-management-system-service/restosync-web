import { Skeleton } from 'restosync-web';

export const Card = () => (
  <div className='flex max-w-sm flex-col gap-3 rounded-xl border p-4'>
    <Skeleton className='h-32 w-full rounded-lg' />
    <Skeleton className='h-4 w-2/3' />
    <Skeleton className='h-4 w-1/3' />
  </div>
);

export const ListRow = () => (
  <div className='flex max-w-sm items-center gap-3'>
    <Skeleton className='size-10 rounded-full' />
    <div className='flex flex-1 flex-col gap-2'>
      <Skeleton className='h-4 w-1/2' />
      <Skeleton className='h-3 w-1/3' />
    </div>
  </div>
);
