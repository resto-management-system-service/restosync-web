import { Button, Input, Label, Modal } from 'restosync-web';

export const Open = () => (
  <Modal
    isOpen
    onClose={() => {}}
    title='Rename category'
    description='This is shown to guests on the storefront.'
  >
    <div className='space-y-3'>
      <div className='space-y-1'>
        <Label htmlFor='r'>Name</Label>
        <Input id='r' defaultValue='Desserts' />
      </div>
      <div className='flex justify-end gap-2'>
        <Button variant='outline'>Cancel</Button>
        <Button>Save</Button>
      </div>
    </div>
  </Modal>
);
