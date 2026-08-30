import {
  Button,
  Input,
  Label,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from 'restosync-web';

export const Open = () => (
  <Sheet defaultOpen>
    <SheetTrigger asChild>
      <Button variant='outline'>Edit item</Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Edit menu item</SheetTitle>
        <SheetDescription>Changes publish to all connected terminals on save.</SheetDescription>
      </SheetHeader>
      <div className='space-y-4 px-4'>
        <div className='space-y-1'>
          <Label htmlFor='n'>Name</Label>
          <Input id='n' defaultValue='Truffle Arancini' />
        </div>
        <div className='space-y-1'>
          <Label htmlFor='pr'>Price</Label>
          <Input id='pr' defaultValue='12.50' />
        </div>
      </div>
      <SheetFooter>
        <Button>Save changes</Button>
        <SheetClose asChild>
          <Button variant='outline'>Cancel</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);
