import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Track from './Track';

const testingTrack = { id: 'track-1', name: 'Flowers', artist: 'Miley Cyrus' };

it('Track is displayed with add button', () => {
  render(<Track
    track={testingTrack}
    addRemoveTrack={true}
    addToPlaylist={() => { }}
    removeFromPlaylist={() => { }}
  />);
  let button = screen.getByRole('button');
  expect(button).toHaveTextContent('+');
})

it('Track is displayed with remove button', () => {
  render(<Track
    track={testingTrack}
    addRemoveTrack={false}
    addToPlaylist={() => { }}
    removeFromPlaylist={() => { }}
  />);
  let button = screen.getByRole('button');
  expect(button).toHaveTextContent('-');
})

it('should displayed track name', () => {
  render(<Track track={testingTrack}
    addRemoveTrack={false}
    addToPlaylist={() => { }}
    removeFromPlaylist={() => { }}
  />);
  let heading = screen.getByRole('heading');
  expect(heading).toHaveTextContent(testingTrack.name)
})

it('should displayed track artist', () => {
  render(<Track track={testingTrack}
    addRemoveTrack={false}
    addToPlaylist={() => { }}
    removeFromPlaylist={() => { }}
  />);
  let textArtist = screen.getByRole('paragraph');
  expect(textArtist).toHaveTextContent(testingTrack.artist)
})

it('calls addToPlaylist when + is clicked', async () => {
  const addToPlaylist = jest.fn();
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
  const removeFromPlaylist = jest.fn();
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
