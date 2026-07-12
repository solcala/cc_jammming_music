import type { Page, Locator } from '@playwright/test';
import { selectors } from './selectors';

/** Shared navigation and locators for Jammming pages. No assertions. */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path);
  }

  playlistSection(): Locator {
    return this.page.getByTestId(selectors.playlistSection);
  }

  appTitle(): Locator {
    return this.page.getByTestId(selectors.appTitle);
  }
}
