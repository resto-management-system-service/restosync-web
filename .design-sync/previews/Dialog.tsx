import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label
} from 'restosync-web';

export const Open = () => (
  <Dialog defaultOpen>
    <DialogTrigger asChild>
      <Button>New category</Button>
    </DialogTrigger>
    <DialogContent className='sm:max-w-md'>
      <DialogHeader>
        <DialogTitle>New category</DialogTitle>
        <DialogDescription>Categories group menu items on the storefront.</DialogDescription>
      </DialogHeader>
      <div className='space-y-2'>
        <Label htmlFor='cat'>Name</Label>
        <Input id='cat' placeholder='e.g. Seasonal specials' />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='outline'>Cancel</Button>
        </DialogClose>
        <Button>Create</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
