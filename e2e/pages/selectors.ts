/** Central registry of `data-testid` strings used by Playwright page objects. */

export const selectors = {
  searchForm: 'search-form',
  searchInput: 'search-by-input',
  searchButton: 'search-button',
  searchError: 'search-error',
  searchEmptyMessage: 'search-empty-message',
  searchApiError: 'search-api-error',
  spotifyConfigError: 'spotify-config-error',

  playlistSection: 'playlist-section',
  playlistTitleInput: 'playlist-title-input',
  playlistMessage: 'playlist-message',
  playlistValidationError: 'playlist-validation-error',
  savePlaylistButton: 'save-playlist-button',

  trackItem: (id: string) => `track-item-${id}`,
  trackName: (id: string) => `track-name-${id}`,
  trackArtist: (id: string) => `track-artist-${id}`,
  trackAdd: (id: string) => `track-add-${id}`,
  trackRemove: (id: string) => `track-remove-${id}`,
} as const;
