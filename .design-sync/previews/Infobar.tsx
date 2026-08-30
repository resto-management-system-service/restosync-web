import {
  Infobar,
  InfobarContent,
  InfobarGroup,
  InfobarGroupContent,
  InfobarGroupLabel,
  InfobarHeader,
  InfobarProvider
} from 'restosync-web';

export const Panel = () => (
  <InfobarProvider className='h-80 min-h-0 overflow-hidden rounded-lg border'>
    <Infobar side='right' collapsible='none'>
      <InfobarHeader className='px-3 py-2 font-semibold'>Details</InfobarHeader>
      <InfobarContent>
        <InfobarGroup>
          <InfobarGroupLabel>Service charge</InfobarGroupLabel>
          <InfobarGroupContent className='text-muted-foreground px-2 text-sm'>
            A 12% service charge is added to every check for parties of 6 or more.
          </InfobarGroupContent>
        </InfobarGroup>
      </InfobarContent>
    </Infobar>
  </InfobarProvider>
);
