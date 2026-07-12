import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { selectors } from './selectors';

/** Playlist panel actions and locators. No assertions. */
export class PlaylistPage extends BasePage {
  titleInput(): Locator {
    return this.page.getByTestId(selectors.playlistTitleInput);
  }

  saveButton(): Locator {
    return this.page.getByTestId(selectors.savePlaylistButton);
  }

  message(): Locator {
    return this.page.getByTestId(selectors.playlistMessage);
  }

  validationError(): Locator {
    return this.page.getByTestId(selectors.playlistValidationError);
  }

  trackInPlaylist(id: string): Locator {
    return this.playlistSection().getByTestId(selectors.trackItem(id));
  }

  trackNameInPlaylist(id: string): Locator {
    return this.playlistSection().getByTestId(selectors.trackName(id));
  }

  trackRemoveButton(id: string): Locator {
    return this.playlistSection().getByTestId(selectors.trackRemove(id));
  }

  async fillTitle(name: string) {
    await this.titleInput().fill(name);
  }

  async clickSave() {
    await this.saveButton().click();
  }

  async savePlaylist(name: string) {
    await this.fillTitle(name);
    await this.clickSave();
  }

  async clickRemoveTrack(id: string) {
    await this.trackRemoveButton(id).click();
  }
}
