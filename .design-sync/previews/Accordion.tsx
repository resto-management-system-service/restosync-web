import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'restosync-web';

export const Single = () => (
  <Accordion type='single' collapsible defaultValue='hours' className='max-w-md'>
    <AccordionItem value='hours'>
      <AccordionTrigger>Opening hours</AccordionTrigger>
      <AccordionContent>Mon–Fri 11:00–22:00, Sat–Sun 10:00–23:00.</AccordionContent>
    </AccordionItem>
    <AccordionItem value='delivery'>
      <AccordionTrigger>Delivery zones</AccordionTrigger>
      <AccordionContent>Within 5 km of the restaurant. Minimum order $20.</AccordionContent>
    </AccordionItem>
    <AccordionItem value='allergens'>
      <AccordionTrigger>Allergen information</AccordionTrigger>
      <AccordionContent>
        Full allergen matrix available on request from any server.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export const Multiple = () => (
  <Accordion type='multiple' defaultValue={['a', 'b']} className='max-w-md'>
    <AccordionItem value='a'>
      <AccordionTrigger>Section A</AccordionTrigger>
      <AccordionContent>Both sections can be open at once.</AccordionContent>
    </AccordionItem>
    <AccordionItem value='b'>
      <AccordionTrigger>Section B</AccordionTrigger>
      <AccordionContent>Independent open state per item.</AccordionContent>
    </AccordionItem>
  </Accordion>
);
