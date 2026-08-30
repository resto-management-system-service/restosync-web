import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from 'restosync-web';

export const Open = () => (
  <Collapsible defaultOpen className='max-w-sm space-y-2'>
    <div className='flex items-center justify-between'>
      <span className='text-sm font-medium'>Modifiers (3)</span>
      <CollapsibleTrigger asChild>
        <Button variant='ghost' size='sm'>
          Toggle
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent className='space-y-1 text-sm'>
      <div className='rounded-md border px-3 py-2'>Extra cheese · +$2.00</div>
      <div className='rounded-md border px-3 py-2'>Gluten-free base · +$3.00</div>
      <div className='rounded-md border px-3 py-2'>Half portion · −$4.00</div>
    </CollapsibleContent>
  </Collapsible>
);
