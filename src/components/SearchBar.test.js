import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

it('shows inline error when searching with an empty query', async () => {
  const user = userEvent.setup();
  render(
    <SearchBar
      search={() => {}}
      searchBy={''}
      setSearchBy={() => {}}
    />
  );
  await user.click(screen.getByTestId('search-button'));
  expect(screen.getByTestId('search-error')).toHaveTextContent('Please enter a song title');
});

it('shows Searching... while a search is in progress', () => {
  render(
    <SearchBar
      search={() => {}}
      searchBy={'Song'}
      setSearchBy={() => {}}
      isSearching={true}
    />
  );
  expect(screen.getByTestId('search-button')).toHaveTextContent('Searching...');
  expect(screen.getByTestId('search-button')).toBeDisabled();
});

it('clears search error when user types in the input', async () => {
  const user = userEvent.setup();

  function SearchBarWrapper() {
    const [searchBy, setSearchBy] = useState('');
    return (
      <SearchBar search={() => {}} searchBy={searchBy} setSearchBy={setSearchBy} />
    );
  }

  render(<SearchBarWrapper />);

  await user.click(screen.getByTestId('search-button'));
  expect(screen.getByTestId('search-error')).toBeInTheDocument();

  await user.type(screen.getByTestId('search-by-input'), 'a');
  expect(screen.queryByTestId('search-error')).not.toBeInTheDocument();
});


it('submits search when Enter is pressed with a non-empty query', async () => {
  const mockSearch = jest.fn();
  const user = userEvent.setup();

  render(
    <SearchBar
      search={mockSearch}
      searchBy={'Song'}
      setSearchBy={() => {}}
    />
  );

  await user.type(screen.getByTestId('search-by-input'), '{enter}');

  expect(mockSearch).toHaveBeenCalledTimes(1);
});

it('shows inline error when Enter is pressed with an empty query', async () => {
  const user = userEvent.setup();

  render(
    <SearchBar
      search={() => {}}
      searchBy={''}
      setSearchBy={() => {}}
    />
  );

  await user.type(screen.getByTestId('search-by-input'), '{enter}');

  expect(screen.getByTestId('search-error')).toHaveTextContent('Please enter a song title');
});


it('associates the search input with a visible label', () => {
  render(
    <SearchBar
      search={() => {}}
      searchBy={''}
      setSearchBy={() => {}}
    />
  );

  expect(screen.getByLabelText('Search by song title')).toBe(screen.getByTestId('search-by-input'));
});
