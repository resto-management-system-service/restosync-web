import { Toaster } from 'restosync-web';

// Toaster is the render target for sonner toasts. It has no visible surface on
// its own; this card documents where it mounts and its configurable props.
export const Placement = () => (
  <div className='relative h-40 w-full max-w-md overflow-hidden rounded-lg border'>
    <div className='text-muted-foreground p-3 text-sm'>App content…</div>
    <div className='absolute right-3 bottom-3 rounded-md border bg-white px-3 py-2 text-sm shadow-md'>
      <div className='font-medium'>Menu published</div>
      <div className='text-muted-foreground'>42 items live on 3 terminals</div>
    </div>
    <Toaster position='bottom-right' />
  </div>
);
