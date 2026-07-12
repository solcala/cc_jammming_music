import type { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { selectors } from './selectors';

/** Search panel actions and locators. No assertions. */
export class SearchPage extends BasePage {
  searchForm(): Locator {
    return this.page.getByTestId(selectors.searchForm);
  }

  searchLabel(): Locator {
    return this.page.getByTestId(selectors.searchLabel);
  }

  searchInput(): Locator {
    return this.page.getByTestId(selectors.searchInput);
  }

  searchButton(): Locator {
    return this.page.getByTestId(selectors.searchButton);
  }

  searchError(): Locator {
    return this.page.getByTestId(selectors.searchError);
  }

  searchEmptyMessage(): Locator {
    return this.page.getByTestId(selectors.searchEmptyMessage);
  }

  searchApiError(): Locator {
    return this.page.getByTestId(selectors.searchApiError);
  }

  resultsHeading(): Locator {
    return this.page.getByTestId(selectors.resultsHeading);
  }

  trackItem(id: string): Locator {
    return this.page.getByTestId(selectors.trackItem(id));
  }

  trackName(id: string): Locator {
    return this.page.getByTestId(selectors.trackName(id));
  }

  trackArtist(id: string): Locator {
    return this.page.getByTestId(selectors.trackArtist(id));
  }

  trackAddButton(id: string): Locator {
    return this.page.getByTestId(selectors.trackAdd(id));
  }

  async fillSearch(query: string) {
    await this.searchInput().fill(query);
  }

  async clickSearch() {
    await this.searchButton().click();
  }

  async fillAndSearch(query: string) {
    await this.fillSearch(query);
    await this.clickSearch();
  }

  async submitSearchWithEnter(query: string) {
    await this.fillSearch(query);
    await this.searchInput().press('Enter');
  }

  async clickAddTrack(id: string) {
    await this.trackAddButton(id).click();
  }
}
