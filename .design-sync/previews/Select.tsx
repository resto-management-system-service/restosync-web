import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from 'restosync-web';

export const Open = () => (
  <Select defaultValue='mains' open>
    <SelectTrigger className='w-56'>
      <SelectValue placeholder='Select category' />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Categories</SelectLabel>
        <SelectItem value='appetizers'>Appetizers</SelectItem>
        <SelectItem value='mains'>Mains</SelectItem>
        <SelectItem value='desserts'>Desserts</SelectItem>
        <SelectItem value='drinks'>Drinks</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

export const Closed = () => (
  <Select defaultValue='mains'>
    <SelectTrigger className='w-56'>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value='mains'>Mains</SelectItem>
      <SelectItem value='drinks'>Drinks</SelectItem>
    </SelectContent>
  </Select>
);
