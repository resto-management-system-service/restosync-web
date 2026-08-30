import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'restosync-web';

export const Open = () => (
  <TooltipProvider>
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant='outline' size='icon' aria-label='Info'>
          ?
        </Button>
      </TooltipTrigger>
      <TooltipContent>Publishes the menu to every connected POS</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
