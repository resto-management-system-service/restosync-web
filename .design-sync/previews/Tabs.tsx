import { Tabs, TabsContent, TabsList, TabsTrigger } from 'restosync-web';

export const Default = () => (
  <Tabs defaultValue='details' className='max-w-md'>
    <TabsList>
      <TabsTrigger value='details'>Details</TabsTrigger>
      <TabsTrigger value='modifiers'>Modifiers</TabsTrigger>
      <TabsTrigger value='availability'>Availability</TabsTrigger>
    </TabsList>
    <TabsContent value='details' className='text-muted-foreground pt-3 text-sm'>
      Name, description, price and category for this menu item.
    </TabsContent>
    <TabsContent value='modifiers' className='pt-3 text-sm'>
      Modifier groups attached to this item.
    </TabsContent>
  </Tabs>
);
