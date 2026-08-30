import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from 'restosync-web';

export const Basic = () => (
  <Card className='max-w-sm'>
    <CardHeader>
      <CardTitle>Monthly revenue</CardTitle>
      <CardDescription>Net sales across all locations, August 2026.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className='text-2xl font-semibold'>$48,120</div>
      <p className='text-muted-foreground text-sm'>+12.4% vs. July</p>
    </CardContent>
  </Card>
);

export const WithFooter = () => (
  <Card className='max-w-sm'>
    <CardHeader>
      <CardTitle>Delete workspace</CardTitle>
      <CardDescription>
        This permanently removes the workspace and all of its menus, orders and reports.
      </CardDescription>
    </CardHeader>
    <CardFooter className='gap-2'>
      <Button variant='outline'>Cancel</Button>
      <Button variant='destructive'>Delete</Button>
    </CardFooter>
  </Card>
);

export const WithAction = () => (
  <Card className='max-w-sm'>
    <CardHeader>
      <CardTitle>Table 12</CardTitle>
      <CardDescription>4 guests · seated 7:45 PM</CardDescription>
      <CardAction>
        <Button size='sm' variant='outline'>
          Open check
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent className='text-muted-foreground text-sm'>
      Current total $132.40 across 9 items.
    </CardContent>
  </Card>
);
