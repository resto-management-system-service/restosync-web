import { Calendar } from 'restosync-web';

export const SingleDate = () => (
  <Calendar
    mode='single'
    defaultMonth={new Date(2026, 7, 1)}
    selected={new Date(2026, 7, 14)}
    className='rounded-md border'
  />
);

export const Range = () => (
  <Calendar
    mode='range'
    defaultMonth={new Date(2026, 7, 1)}
    selected={{ from: new Date(2026, 7, 10), to: new Date(2026, 7, 16) }}
    className='rounded-md border'
  />
);
