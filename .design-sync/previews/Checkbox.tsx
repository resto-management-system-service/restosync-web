import { Checkbox, Label } from 'restosync-web';

export const States = () => (
  <div className='flex flex-col gap-3'>
    <Label className='flex items-center gap-2'>
      <Checkbox /> Unchecked
    </Label>
    <Label className='flex items-center gap-2'>
      <Checkbox defaultChecked /> Checked
    </Label>
    <Label className='flex items-center gap-2 opacity-60'>
      <Checkbox disabled /> Disabled
    </Label>
    <Label className='flex items-center gap-2'>
      <Checkbox defaultChecked disabled /> Disabled checked
    </Label>
  </div>
);

export const List = () => (
  <div className='flex flex-col gap-2'>
    {['Gluten free', 'Vegan', 'Contains nuts', 'Spicy'].map((t, i) => (
      <Label key={t} className='flex items-center gap-2'>
        <Checkbox defaultChecked={i < 2} /> {t}
      </Label>
    ))}
  </div>
);
