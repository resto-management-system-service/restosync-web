import { Avatar, AvatarFallback, AvatarImage } from 'restosync-web';

export const WithImage = () => (
  <Avatar>
    <AvatarImage src='https://i.pravatar.cc/80?img=12' alt='Chef Alba' />
    <AvatarFallback>AL</AvatarFallback>
  </Avatar>
);

export const Fallback = () => (
  <div className='flex items-center gap-3'>
    <Avatar>
      <AvatarFallback>MC</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>+5</AvatarFallback>
    </Avatar>
  </div>
);

export const Stack = () => (
  <div className='flex -space-x-2'>
    {['A', 'B', 'C', 'D'].map((c) => (
      <Avatar key={c} className='ring-background ring-2'>
        <AvatarFallback>{c}</AvatarFallback>
      </Avatar>
    ))}
  </div>
);
