import { NotificationCard } from 'restosync-web';

export const Unread = () => (
  <div className='max-w-md'>
    <NotificationCard
      id='n1'
      title='New online order #1042'
      body='2× Margherita, 1× Negroni — $41.00. Requested pickup at 7:30 PM.'
      status='unread'
      createdAt={new Date(Date.now() - 1000 * 60 * 8)}
      actions={[
        { id: 'accept', label: 'Accept', type: 'api_call', style: 'primary' },
        { id: 'decline', label: 'Decline', type: 'api_call', style: 'danger' }
      ]}
    />
  </div>
);

export const Read = () => (
  <div className='max-w-md'>
    <NotificationCard
      id='n2'
      title='Nightly report ready'
      body='Yesterday: $3,410 net sales across 84 covers.'
      status='read'
      createdAt={new Date(Date.now() - 1000 * 60 * 60 * 20)}
    />
  </div>
);
