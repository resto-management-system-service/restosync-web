import { Button, ButtonGroup, ButtonGroupText } from 'restosync-web';

export const Horizontal = () => (
  <ButtonGroup>
    <Button variant='outline'>Day</Button>
    <Button variant='outline'>Week</Button>
    <Button variant='outline'>Month</Button>
  </ButtonGroup>
);

export const WithText = () => (
  <ButtonGroup>
    <ButtonGroupText>Sort</ButtonGroupText>
    <Button variant='outline'>Name</Button>
    <Button variant='outline'>Price</Button>
  </ButtonGroup>
);

export const Vertical = () => (
  <ButtonGroup orientation='vertical'>
    <Button variant='outline'>Edit</Button>
    <Button variant='outline'>Duplicate</Button>
    <Button variant='outline'>Archive</Button>
  </ButtonGroup>
);
