import { vi } from 'vitest';
import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { Track as TrackType } from '../types/spotify';
import Track from './Track';

const testingTrack: TrackType = {
  id: 'track-1',
  name: 'Flowers',
  artist: 'Miley Cyrus',
  album: 'Endless Summer Vacation',
  uri: 'spotify:track:track-1',
};

it('Track is displayed with add button', () => {
  render(
    <Track
      track={testingTrack}
      addRemoveTrack={true}
      addToPlaylist={() => {}}
      removeFromPlaylist={() => {}}
    />,
  );
  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('+');
});

it('Track is displayed with remove button', () => {
  render(
    <Track
      track={testingTrack}
      addRemoveTrack={false}
      addToPlaylist={() => {}}
      removeFromPlaylist={() => {}}
    />,
  );
  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('-');
});

it('should displayed track name', () => {
  render(
    <Track
      track={testingTrack}
      addRemoveTrack={false}
      addToPlaylist={() => {}}
      removeFromPlaylist={() => {}}
    />,
  );
  expect(screen.getByTestId('track-name-track-1')).toHaveTextContent(
    testingTrack.name,
  );
});

it('should displayed track artist', () => {
  render(
    <Track
      track={testingTrack}
      addRemoveTrack={false}
      addToPlaylist={() => {}}
      removeFromPlaylist={() => {}}
    />,
  );
  expect(screen.getByTestId('track-artist-track-1')).toHaveTextContent(
    testingTrack.artist,
  );
});

it('calls addToPlaylist when + is clicked', async () => {
  const addToPlaylist = vi.fn();
  const user = userEvent.setup();

  render(
    <Track
      track={testingTrack}
      addRemoveTrack={true}
      addToPlaylist={addToPlaylist}
      removeFromPlaylist={() => {}}
    />,
  );

  await user.click(screen.getByTestId('track-add-track-1'));
  expect(addToPlaylist).toHaveBeenCalledWith(testingTrack);
});

it('calls removeFromPlaylist when - is clicked', async () => {
  const removeFromPlaylist = vi.fn();
  const user = userEvent.setup();

  render(
    <Track
      track={testingTrack}
      addRemoveTrack={false}
      addToPlaylist={() => {}}
      removeFromPlaylist={removeFromPlaylist}
    />,
  );

  await user.click(screen.getByTestId('track-remove-track-1'));
  expect(removeFromPlaylist).toHaveBeenCalledWith(testingTrack);
});
