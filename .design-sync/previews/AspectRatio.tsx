import { AspectRatio } from 'restosync-web';

export const Ratio16x9 = () => (
  <div className='max-w-sm'>
    <AspectRatio ratio={16 / 9} className='bg-muted overflow-hidden rounded-lg'>
      <img
        src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=640'
        alt='Pizza'
        className='h-full w-full object-cover'
      />
    </AspectRatio>
  </div>
);

export const Square = () => (
  <div className='w-40'>
    <AspectRatio ratio={1} className='bg-muted flex items-center justify-center rounded-lg'>
      <span className='text-muted-foreground text-sm'>1:1</span>
    </AspectRatio>
  </div>
);
