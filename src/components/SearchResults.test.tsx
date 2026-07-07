import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Track } from '../types/spotify';
import SearchResults from './SearchResults';

const mockTracks: Track[] = [
  {
    id: '1',
    name: 'Track A',
    artist: 'Artist A',
    album: 'Album A',
    uri: 'spotify:track:1',
  },
];

it('search Results section has results as heading', () => {
  render(<SearchResults results={[]} addToPlaylist={() => {}} />);
  const heading = screen.getByRole('heading');
  expect(heading).toHaveTextContent('Results');
});

it('renders tracks passed as results', () => {
  render(<SearchResults results={mockTracks} addToPlaylist={() => {}} />);
  expect(screen.getByText('Track A')).toBeInTheDocument();
});

it('shows empty state after a search with no results', () => {
  render(
    <SearchResults results={[]} hasSearched={true} addToPlaylist={() => {}} />,
  );
  expect(screen.getByTestId('search-empty-message')).toHaveTextContent(
    'No results found',
  );
});
