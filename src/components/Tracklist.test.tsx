import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Track as TrackType } from '../types/spotify';
import Tracklist from './Tracklist';

const mockTracks: TrackType[] = [
  {
    id: '1',
    name: 'Song One',
    artist: 'Artist A',
    album: 'Album A',
    uri: 'spotify:track:1',
  },
  {
    id: '2',
    name: 'Song Two',
    artist: 'Artist B',
    album: 'Album B',
    uri: 'spotify:track:2',
  },
];

it('renders a track for each item in the tracks array', () => {
  render(
    <Tracklist
      tracks={mockTracks}
      addRemoveTrack={true}
      addToPlaylist={() => {}}
      removeFromPlaylist={() => {}}
    />,
  );
  const headings = screen.getAllByRole('heading');
  expect(headings).toHaveLength(2);
  expect(headings[0]).toHaveTextContent('Song One');
  expect(headings[1]).toHaveTextContent('Song Two');
});

it('renders nothing when tracks is undefined', () => {
  render(
    <Tracklist
      addRemoveTrack={true}
      addToPlaylist={() => {}}
      removeFromPlaylist={() => {}}
    />,
  );
  expect(screen.queryAllByTestId(/^track-item-/)).toHaveLength(0);
});
