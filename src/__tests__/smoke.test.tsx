import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

test('renders text', async () => {
  await render(<Text>earshot</Text>);
  expect(screen.getByText('earshot')).toBeTruthy();
});
