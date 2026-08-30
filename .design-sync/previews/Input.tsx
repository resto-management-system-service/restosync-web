import { Input, Label } from 'restosync-web';

export const Default = () => (
  <div className='flex max-w-sm flex-col gap-2'>
    <Label htmlFor='dish'>Dish name</Label>
    <Input id='dish' placeholder='e.g. Margherita Pizza' defaultValue='Truffle Arancini' />
  </div>
);

export const Types = () => (
  <div className='flex max-w-sm flex-col gap-3'>
    <Input type='email' placeholder='you@restaurant.com' />
    <Input type='number' placeholder='0.00' defaultValue={14} />
    <Input type='password' defaultValue='secret-value' />
  </div>
);

export const States = () => (
  <div className='flex max-w-sm flex-col gap-3'>
    <Input placeholder='Disabled' disabled />
    <Input placeholder='Invalid' aria-invalid defaultValue='not-an-email' />
    <Input readOnly defaultValue='Read only' />
  </div>
);
