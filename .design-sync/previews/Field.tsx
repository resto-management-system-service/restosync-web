import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, Input } from 'restosync-web';

export const Default = () => (
  <FieldGroup className='max-w-sm'>
    <Field>
      <FieldLabel htmlFor='name'>Item name</FieldLabel>
      <Input id='name' defaultValue='Truffle Arancini' />
      <FieldDescription>Shown to guests on the menu.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel htmlFor='price'>Price</FieldLabel>
      <Input id='price' aria-invalid defaultValue='-2' />
      <FieldError>Price must be greater than 0.</FieldError>
    </Field>
  </FieldGroup>
);
