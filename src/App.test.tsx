import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mocked } from 'vitest';
import type { Track } from './types/spotify';
import App from './App';
import Spotify from './util/Spotify';

vi.mock('./util/Spotify');

const mockTracks: Track[] = [
  {
    id: 'track-1',
    name: 'Test Song One',
    artist: 'Test Artist',
    album: 'Test Album',
    uri: 'spotify:track:track-1',
  },
  {
    id: 'track-2',
    name: 'Test Song Two',
    artist: 'Another Artist',
    album: 'Another Album',
    uri: 'spotify:track:track-2',
  },
];

const mockedSpotify = Spotify as Mocked<typeof Spotify>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', '0123456789abcdef0123456789abcdef');
  vi.stubEnv('VITE_REDIRECT_URI', 'http://127.0.0.1:3000/cc_jammming_music/');
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://127.0.0.1:3000/cc_jammming_music/',
      origin: 'http://127.0.0.1:3000',
      hostname: '127.0.0.1',
      port: '3000',
    },
    writable: true,
    configurable: true,
  });
  mockedSpotify.search.mockResolvedValue(mockTracks);
  mockedSpotify.savePlaylist.mockResolvedValue(201);
  mockedSpotify.checkAccessToken.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function searchForTracks(
  user: ReturnType<typeof userEvent.setup>,
  term = 'test',
) {
  await user.type(screen.getByTestId('search-by-input'), term);
  await user.click(screen.getByTestId('search-button'));
  await waitFor(() => {
    expect(screen.getByTestId('track-name-track-1')).toBeInTheDocument();
  });
}

it('renders Jamming Title', () => {
  render(<App />);
  expect(screen.getByText(/Jamming/i)).toBeInTheDocument();
});

it('user is allow to add title', async () => {
  const user = userEvent.setup();
  render(<App />);
  const input = screen.getByRole('textbox', { name: 'playlist-title' });
  await user.type(input, 'Playlist Title');
  expect(input).toHaveValue('Playlist Title');
});

it('search populates results from mocked Spotify', async () => {
  const user = userEvent.setup();
  render(<App />);

  await searchForTracks(user);

  expect(mockedSpotify.search).toHaveBeenCalledWith('test');
  expect(screen.getByTestId('track-name-track-1')).toHaveTextContent(
    'Test Song One',
  );
  expect(screen.getByTestId('track-name-track-2')).toHaveTextContent(
    'Test Song Two',
  );
});

it('shows search error when Spotify search fails', async () => {
  mockedSpotify.search.mockResolvedValue({ error: true });
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByTestId('search-by-input'), 'test');
  await user.click(screen.getByTestId('search-button'));

  await waitFor(() => {
    expect(screen.getByTestId('search-api-error')).toHaveTextContent(
      'Unable to search right now. Please try again.',
    );
  });
  expect(screen.queryByTestId('track-name-track-1')).not.toBeInTheDocument();
});

it('clears search API error when the user types again', async () => {
  mockedSpotify.search.mockResolvedValue({ error: true });
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByTestId('search-by-input'), 'test');
  await user.click(screen.getByTestId('search-button'));

  await waitFor(() => {
    expect(screen.getByTestId('search-api-error')).toBeInTheDocument();
  });

  await user.type(screen.getByTestId('search-by-input'), 'x');

  expect(screen.queryByTestId('search-api-error')).not.toBeInTheDocument();
});

it('shows inline error on empty search without calling Spotify', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByTestId('search-button'));

  expect(screen.getByTestId('search-error')).toHaveTextContent(
    'Please enter a song title',
  );
  expect(mockedSpotify.search).not.toHaveBeenCalled();
});

it('adds a track from search results to the playlist panel', async () => {
  const user = userEvent.setup();
  render(<App />);

  await searchForTracks(user);
  await user.click(screen.getByTestId('track-add-track-1'));

  const playlist = screen.getByTestId('playlist-section');
  expect(within(playlist).getByTestId('track-remove-track-1')).toBeInTheDocument();
  expect(within(playlist).getByTestId('track-name-track-1')).toHaveTextContent(
    'Test Song One',
  );
});

it('shows duplicate track message when adding the same track twice', async () => {
  const user = userEvent.setup();
  render(<App />);

  await searchForTracks(user);
  await user.click(screen.getByTestId('track-add-track-1'));
  await user.click(screen.getByTestId('track-add-track-1'));

  expect(screen.getByTestId('playlist-message')).toHaveTextContent(
    'This song is in the playlist.',
  );
});

it('clears duplicate track message when a different track is added', async () => {
  const user = userEvent.setup();
  render(<App />);

  await searchForTracks(user);
  await user.click(screen.getByTestId('track-add-track-1'));
  await user.click(screen.getByTestId('track-add-track-1'));
  expect(screen.getByTestId('playlist-message')).toHaveTextContent(
    'This song is in the playlist.',
  );

  await user.click(screen.getByTestId('track-add-track-2'));

  expect(screen.getByTestId('playlist-message')).toHaveTextContent('');
});

it('removes a track from the playlist panel', async () => {
  const user = userEvent.setup();
  render(<App />);

  await searchForTracks(user);
  await user.click(screen.getByTestId('track-add-track-1'));
  await user.click(screen.getByTestId('track-remove-track-1'));

  expect(screen.queryByTestId('track-remove-track-1')).not.toBeInTheDocument();
});

it('clears playlist and shows success message after successful save', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByTestId('playlist-title-input'), 'My Playlist');
  await searchForTracks(user);
  await user.click(screen.getByTestId('track-add-track-1'));
  await user.click(screen.getByTestId('save-playlist-button'));

  await waitFor(() => {
    expect(screen.getByTestId('playlist-message')).toHaveTextContent(
      'Playlist created',
    );
  });
  expect(screen.getByTestId('playlist-title-input')).toHaveValue('');
  expect(screen.queryByTestId('track-remove-track-1')).not.toBeInTheDocument();
  expect(mockedSpotify.savePlaylist).toHaveBeenCalledWith('My Playlist', [
    'spotify:track:track-1',
  ]);
});

it('shows error message when save fails', async () => {
  mockedSpotify.savePlaylist.mockResolvedValue(undefined);
  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByTestId('playlist-title-input'), 'My Playlist');
  await searchForTracks(user);
  await user.click(screen.getByTestId('track-add-track-1'));
  await user.click(screen.getByTestId('save-playlist-button'));

  await waitFor(() => {
    expect(screen.getByTestId('playlist-message')).toHaveTextContent(
      'Unable to save playlist. Please try again.',
    );
  });
});

it('shows Searching... while search is in flight', async () => {
  let resolveSearch: (value: Track[]) => void;
  mockedSpotify.search.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
  );

  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByTestId('search-by-input'), 'test');
  await user.click(screen.getByTestId('search-button'));

  expect(screen.getByTestId('search-button')).toHaveTextContent('Searching...');
  expect(screen.getByTestId('search-button')).toBeDisabled();

  resolveSearch!(mockTracks);
  await waitFor(() => {
    expect(screen.getByTestId('search-button')).toHaveTextContent('Search');
  });
});

it('shows Saving... while save is in flight', async () => {
  let resolveSave: (value: number) => void;
  mockedSpotify.savePlaylist.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveSave = resolve;
      }),
  );

  const user = userEvent.setup();
  render(<App />);

  await user.type(screen.getByTestId('playlist-title-input'), 'My Playlist');
  await searchForTracks(user);
  await user.click(screen.getByTestId('track-add-track-1'));
  await user.click(screen.getByTestId('save-playlist-button'));

  expect(screen.getByTestId('save-playlist-button')).toHaveTextContent(
    'Saving...',
  );
  expect(screen.getByTestId('save-playlist-button')).toBeDisabled();

  resolveSave!(201);
  await waitFor(() => {
    expect(screen.getByTestId('save-playlist-button')).toHaveTextContent(
      'Save to Spotify',
    );
  });
});
