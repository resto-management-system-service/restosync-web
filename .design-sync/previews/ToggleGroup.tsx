import { ToggleGroup, ToggleGroupItem } from 'restosync-web';

export const SingleSelect = () => (
  <ToggleGroup type='single' defaultValue='lunch' variant='outline'>
    <ToggleGroupItem value='breakfast'>Breakfast</ToggleGroupItem>
    <ToggleGroupItem value='lunch'>Lunch</ToggleGroupItem>
    <ToggleGroupItem value='dinner'>Dinner</ToggleGroupItem>
  </ToggleGroup>
);

export const MultiSelect = () => (
  <ToggleGroup type='multiple' defaultValue={['vegan', 'gf']}>
    <ToggleGroupItem value='vegan'>Vegan</ToggleGroupItem>
    <ToggleGroupItem value='gf'>GF</ToggleGroupItem>
    <ToggleGroupItem value='halal'>Halal</ToggleGroupItem>
  </ToggleGroup>
);
