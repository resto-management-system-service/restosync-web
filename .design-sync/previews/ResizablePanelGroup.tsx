import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from 'restosync-web';

export const Horizontal = () => (
  <ResizablePanelGroup direction='horizontal' className='h-40 max-w-md rounded-lg border'>
    <ResizablePanel defaultSize={35}>
      <div className='flex h-full items-center justify-center p-4 text-sm'>Categories</div>
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={65}>
      <div className='flex h-full items-center justify-center p-4 text-sm'>Items</div>
    </ResizablePanel>
  </ResizablePanelGroup>
);
