import { Progress } from 'restosync-web';

export const Levels = () => (
  <div className='flex max-w-sm flex-col gap-4'>
    <Progress value={12} />
    <Progress value={54} />
    <Progress value={100} />
  </div>
);

export const Labeled = () => (
  <div className='flex max-w-sm flex-col gap-2'>
    <div className='flex justify-between text-sm'>
      <span>Menu import</span>
      <span className='text-muted-foreground'>72%</span>
    </div>
    <Progress value={72} />
  </div>
);
