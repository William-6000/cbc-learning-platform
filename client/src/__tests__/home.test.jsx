import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home.jsx';

test('renders CBC Senior School hero', () => {
  render(<MemoryRouter><Home /></MemoryRouter>);
  expect(screen.getByText(/Competency-Based Senior School/i)).toBeInTheDocument();
});
