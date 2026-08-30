import { Button, Spinner } from 'restosync-web';

export const Default = () => <Spinner />;

export const Sizes = () => (
  <div className='flex items-center gap-4'>
    <Spinner className='size-4' />
    <Spinner className='size-6' />
    <Spinner className='size-8' />
  </div>
);

export const InButton = () => (
  <Button disabled>
    <Spinner className='size-4' />
    Publishing menu…
  </Button>
);
