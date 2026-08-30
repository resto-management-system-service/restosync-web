import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from 'restosync-web';

export const WithPrefix = () => (
  <InputGroup className='max-w-xs'>
    <InputGroupAddon>
      <InputGroupText>$</InputGroupText>
    </InputGroupAddon>
    <InputGroupInput placeholder='0.00' defaultValue='14.00' />
  </InputGroup>
);

export const WithSuffix = () => (
  <InputGroup className='max-w-xs'>
    <InputGroupInput placeholder='Table' defaultValue='12' />
    <InputGroupAddon align='inline-end'>
      <InputGroupText>seats</InputGroupText>
    </InputGroupAddon>
  </InputGroup>
);
