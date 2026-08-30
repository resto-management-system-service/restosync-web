import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from 'restosync-web';

const data = [
  { day: 'Mon', covers: 82 },
  { day: 'Tue', covers: 74 },
  { day: 'Wed', covers: 96 },
  { day: 'Thu', covers: 88 },
  { day: 'Fri', covers: 140 },
  { day: 'Sat', covers: 165 },
  { day: 'Sun', covers: 120 }
];

const config = { covers: { label: 'Covers', color: 'var(--chart-1)' } };

export const Bars = () => (
  <ChartContainer config={config} className='h-56 w-full max-w-md'>
    <BarChart data={data}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey='day' tickLine={false} axisLine={false} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey='covers' fill='var(--color-covers)' radius={4} />
    </BarChart>
  </ChartContainer>
);
