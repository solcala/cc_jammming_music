import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { PlaylistPage } from './PlaylistPage';
import { SearchPage } from './SearchPage';
import { selectors } from './selectors';

/** Thin facade composing Search + Playlist page objects. No assertions. */
export class AppPage extends BasePage {
  readonly search: SearchPage;
  readonly playlist: PlaylistPage;

  constructor(page: Page) {
    super(page);
    this.search = new SearchPage(page);
    this.playlist = new PlaylistPage(page);
  }

  spotifyConfigError() {
    return this.page.getByTestId(selectors.spotifyConfigError);
  }

  /** Search and add a track by id (default: first mock track). */
  async searchAndAddTrack(query = 'test song', trackId = 'track-1') {
    await this.search.fillAndSearch(query);
    await this.search.clickAddTrack(trackId);
  }
}
