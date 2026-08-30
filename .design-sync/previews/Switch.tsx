import { Label, Switch } from 'restosync-web';

export const States = () => (
  <div className='flex flex-col gap-3'>
    <Label className='flex items-center gap-3'>
      <Switch /> Off
    </Label>
    <Label className='flex items-center gap-3'>
      <Switch defaultChecked /> On
    </Label>
    <Label className='flex items-center gap-3 opacity-60'>
      <Switch disabled /> Disabled
    </Label>
  </div>
);

export const SettingRow = () => (
  <div className='flex max-w-sm items-center justify-between gap-4'>
    <div>
      <div className='text-sm font-medium'>Accept online orders</div>
      <div className='text-muted-foreground text-sm'>Show this location on the storefront.</div>
    </div>
    <Switch defaultChecked />
  </div>
);
