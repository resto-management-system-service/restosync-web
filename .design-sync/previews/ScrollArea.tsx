import { ScrollArea, Separator } from 'restosync-web';

const cats = [
  'Appetizers',
  'Soups',
  'Salads',
  'Pasta',
  'Mains',
  'Sides',
  'Desserts',
  'Wine',
  'Cocktails',
  'Beer',
  'Coffee',
  'Tea'
];

export const List = () => (
  <ScrollArea className='h-48 w-56 rounded-md border'>
    <div className='p-3'>
      <div className='text-sm font-medium'>Categories</div>
      {cats.map((c) => (
        <div key={c}>
          <div className='py-1.5 text-sm'>{c}</div>
          <Separator />
        </div>
      ))}
    </div>
  </ScrollArea>
);
