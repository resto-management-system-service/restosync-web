import { Label, RadioGroup, RadioGroupItem } from 'restosync-web';

export const Default = () => (
  <RadioGroup defaultValue='dine-in' className='flex flex-col gap-3'>
    {[
      ['dine-in', 'Dine in'],
      ['takeout', 'Takeout'],
      ['delivery', 'Delivery']
    ].map(([v, label]) => (
      <Label key={v} className='flex items-center gap-2'>
        <RadioGroupItem value={v} /> {label}
      </Label>
    ))}
  </RadioGroup>
);

export const Disabled = () => (
  <RadioGroup defaultValue='a' className='flex flex-col gap-3 opacity-60'>
    <Label className='flex items-center gap-2'>
      <RadioGroupItem value='a' disabled /> Option A
    </Label>
    <Label className='flex items-center gap-2'>
      <RadioGroupItem value='b' disabled /> Option B
    </Label>
  </RadioGroup>
);
