import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from 'restosync-web';

const rows = [
  { name: 'Margherita Pizza', category: 'Mains', price: '$14.00', status: 'Available' },
  { name: 'Truffle Arancini', category: 'Appetizers', price: '$12.50', status: 'Available' },
  { name: 'Tiramisu', category: 'Desserts', price: '$9.00', status: 'Unavailable' },
  { name: 'Negroni', category: 'Drinks', price: '$13.00', status: 'Available' }
];

export const MenuItems = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Item</TableHead>
        <TableHead>Category</TableHead>
        <TableHead className='text-right'>Price</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => (
        <TableRow key={r.name}>
          <TableCell className='font-medium'>{r.name}</TableCell>
          <TableCell className='text-muted-foreground'>{r.category}</TableCell>
          <TableCell className='text-right'>{r.price}</TableCell>
          <TableCell>
            <Badge variant={r.status === 'Available' ? 'secondary' : 'outline'}>{r.status}</Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableCaption>4 of 42 menu items</TableCaption>
  </Table>
);
