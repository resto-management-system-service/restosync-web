import { Checkbox, Input, Label } from 'restosync-web';

export const Default = () => <Label htmlFor='x'>Table number</Label>;

export const WithControl = () => (
  <div className='flex max-w-sm flex-col gap-2'>
    <Label htmlFor='covers'>Covers</Label>
    <Input id='covers' type='number' defaultValue={4} />
  </div>
);

export const WithCheckbox = () => (
  <Label className='flex items-center gap-2'>
    <Checkbox defaultChecked />
    Mark item as available
  </Label>
);
