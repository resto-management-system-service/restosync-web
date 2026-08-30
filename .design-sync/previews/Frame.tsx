import {
  Button,
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle
} from 'restosync-web';

export const Panel = () => (
  <Frame className='max-w-md'>
    <FramePanel>
      <FrameHeader>
        <FrameTitle>Storefront</FrameTitle>
        <FrameDescription>Control what guests see online.</FrameDescription>
      </FrameHeader>
      <div className='text-muted-foreground px-4 text-sm'>
        Online ordering is enabled. Delivery radius 5 km.
      </div>
      <FrameFooter>
        <Button size='sm' variant='outline'>
          Manage
        </Button>
      </FrameFooter>
    </FramePanel>
  </Frame>
);
