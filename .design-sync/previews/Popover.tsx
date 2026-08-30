import { Button, Label, Input, Popover, PopoverContent, PopoverTrigger } from 'restosync-web';

export const Open = () => (
  <Popover defaultOpen>
    <PopoverTrigger asChild>
      <Button variant='outline'>Adjust price</Button>
    </PopoverTrigger>
    <PopoverContent className='w-64 space-y-3'>
      <div className='text-sm font-medium'>Quick edit</div>
      <div className='space-y-1'>
        <Label htmlFor='p'>Price</Label>
        <Input id='p' defaultValue='14.00' />
      </div>
      <Button size='sm' className='w-full'>
        Save
      </Button>
    </PopoverContent>
  </Popover>
);
