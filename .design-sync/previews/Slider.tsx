import { Label, Slider } from 'restosync-web';

export const Single = () => (
  <div className='flex max-w-sm flex-col gap-3'>
    <Label>Spice level</Label>
    <Slider defaultValue={[2]} min={0} max={5} step={1} />
  </div>
);

export const Range = () => (
  <div className='flex max-w-sm flex-col gap-3'>
    <Label>Price range</Label>
    <Slider defaultValue={[8, 24]} min={0} max={40} step={1} />
  </div>
);

export const Disabled = () => (
  <div className='max-w-sm opacity-60'>
    <Slider defaultValue={[40]} disabled />
  </div>
);
