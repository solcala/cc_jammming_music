import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';
import App from '../App';

it('renders search section', () => {
  render(<SearchBar
    search={() => { }}
    searchBy={'Song'}
    setSearchBy={() => { }} />);
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('Song');

});

it('set value renders empty', () => {
  render(<App />);
  const input = screen.getByTestId('search-by-input');
  expect(input).toHaveValue('');
});

it('have search button enable', () => {
  render(<SearchBar
    search={() => { }}
    searchBy={'Song'}
    setSearchBy={() => { }} />);
  const button = screen.getByTestId('search-button');
  expect(button).toBeEnabled();
});

it('calls search callback when button is clicked with a non-empty query', () => {
  const mockSearch = jest.fn();
  render(
    <SearchBar
      search={mockSearch}
      searchBy={'Song'}
      setSearchBy={() => {}}
    />
  );
  const button = screen.getByTestId('search-button');
  button.click();
  expect(mockSearch).toHaveBeenCalledTimes(1);
});
