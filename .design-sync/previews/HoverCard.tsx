import { Button, HoverCard, HoverCardContent, HoverCardTrigger } from 'restosync-web';

export const Open = () => (
  <HoverCard defaultOpen>
    <HoverCardTrigger asChild>
      <Button variant='link'>Truffle Arancini</Button>
    </HoverCardTrigger>
    <HoverCardContent className='w-72'>
      <div className='text-sm font-medium'>Truffle Arancini</div>
      <p className='text-muted-foreground mt-1 text-sm'>
        Crispy risotto balls, black truffle, aged parmesan. Contains gluten and dairy.
      </p>
      <div className='mt-2 text-sm font-medium'>$12.50</div>
    </HoverCardContent>
  </HoverCard>
);
