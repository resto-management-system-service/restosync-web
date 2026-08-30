import { Label, Textarea } from 'restosync-web';

export const Default = () => (
  <div className='flex max-w-md flex-col gap-2'>
    <Label htmlFor='desc'>Item description</Label>
    <Textarea
      id='desc'
      rows={4}
      defaultValue='Crispy risotto balls with black truffle and aged parmesan, served with a warm marinara.'
    />
  </div>
);

export const States = () => (
  <div className='flex max-w-md flex-col gap-3'>
    <Textarea placeholder='Add prep notes…' />
    <Textarea placeholder='Disabled' disabled />
    <Textarea aria-invalid defaultValue='Too short' />
  </div>
);
