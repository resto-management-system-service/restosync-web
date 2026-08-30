import { InfoButton, InfobarProvider } from 'restosync-web';

export const Default = () => (
  <InfobarProvider defaultOpen={false}>
    <div className='flex items-center gap-2'>
      <span className='text-sm font-medium'>Service charge</span>
      <InfoButton
        content={{
          title: 'Service charge',
          description: 'A 12% service charge is added to every check for parties of 6 or more.'
        }}
      />
    </div>
  </InfobarProvider>
);
