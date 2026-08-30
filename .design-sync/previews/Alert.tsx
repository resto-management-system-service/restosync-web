import { Alert, AlertDescription, AlertTitle } from 'restosync-web';

const Info = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 16v-4M12 8h.01' />
  </svg>
);

const Warn = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden>
    <path d='m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' />
    <path d='M12 9v4M12 17h.01' />
  </svg>
);

export const Default = () => (
  <Alert className='max-w-md'>
    <Info />
    <AlertTitle>Menu synced</AlertTitle>
    <AlertDescription>
      42 items and 6 categories were published to all connected POS terminals.
    </AlertDescription>
  </Alert>
);

export const Destructive = () => (
  <Alert variant='destructive' className='max-w-md'>
    <Warn />
    <AlertTitle>Payment provider disconnected</AlertTitle>
    <AlertDescription>
      Card payments are paused. Reconnect Stripe from Settings to resume checkout.
    </AlertDescription>
  </Alert>
);

export const TitleOnly = () => (
  <Alert className='max-w-md'>
    <Info />
    <AlertTitle>Nightly backup completed at 3:00 AM.</AlertTitle>
  </Alert>
);
