import React from 'react';
import { render } from '@testing-library/react';
import DepartureBoard from './MbtaDepartureBoard';

test('renders learn react link', () => {
  const { getByText } = render(<DepartureBoard />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
