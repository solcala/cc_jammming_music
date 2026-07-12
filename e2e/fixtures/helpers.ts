import type { Page } from '@playwright/test';

/** Returns whether the document scrolls wider than the viewport. No assertion. */
export async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}
