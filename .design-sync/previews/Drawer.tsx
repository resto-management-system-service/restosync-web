import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from 'restosync-web';

export const Open = () => (
  <Drawer defaultOpen>
    <DrawerTrigger asChild>
      <Button variant='outline'>Open check</Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Table 12 — check</DrawerTitle>
        <DrawerDescription>9 items · subtotal $132.40</DrawerDescription>
      </DrawerHeader>
      <div className='px-4 text-sm'>
        <div className='flex justify-between py-1'>
          <span>2× Margherita</span>
          <span>$28.00</span>
        </div>
        <div className='flex justify-between py-1'>
          <span>1× Negroni</span>
          <span>$13.00</span>
        </div>
      </div>
      <DrawerFooter>
        <Button>Send to kitchen</Button>
        <DrawerClose asChild>
          <Button variant='outline'>Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);
