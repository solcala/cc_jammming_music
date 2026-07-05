import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Playlist from './Playlist';

const defaultProps = {
  playlistTracks: [],
  removeFromPlaylist: () => {},
  savePlaylist: () => {},
  playlistName: '',
  setPlaylistName: () => {},
  addMessage: () => {},
  message: '',
};

it('input to add title with placeholder', () => {
  render(<Playlist {...defaultProps} />);
  const input = screen.getByRole('textbox');
  expect(input.getAttribute('placeholder')).toBe('Add a playlist title');
});

it('save to playlist button is displayed', () => {
  render(<Playlist {...defaultProps} />);
  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('Save to Spotify');
});

it('displays tracks when provided', () => {
  const tracks = [
    { id: '1', name: 'My Song', artist: 'Artist X', album: 'Album X', uri: 'spotify:track:1' },
  ];
  render(<Playlist {...defaultProps} playlistTracks={tracks} />);
  expect(screen.getByText('My Song')).toBeInTheDocument();
});

it('displays the playlist message', () => {
  render(<Playlist {...defaultProps} message="Playlist created" />);
  expect(screen.getByTestId('playlist-message')).toHaveTextContent('Playlist created');
});
