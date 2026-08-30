import { Separator } from 'restosync-web';

export const Horizontal = () => (
  <div className='max-w-sm'>
    <div className='text-sm font-medium'>Menu settings</div>
    <p className='text-muted-foreground text-sm'>Manage categories and availability.</p>
    <Separator className='my-4' />
    <div className='text-sm font-medium'>Danger zone</div>
  </div>
);

export const Vertical = () => (
  <div className='flex h-6 items-center gap-3 text-sm'>
    <span>Dine-in</span>
    <Separator orientation='vertical' />
    <span>Takeout</span>
    <Separator orientation='vertical' />
    <span>Delivery</span>
  </div>
);
