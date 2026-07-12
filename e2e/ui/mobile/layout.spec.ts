import { test, expect } from '../../fixtures/test';
import { hasHorizontalOverflow } from '../../fixtures/helpers';
import { AppPage, SearchPage } from '../../pages';

test.describe('Mobile layout', () => {
  test('loads without horizontal overflow', async ({ page }) => {
    const app = new AppPage(page);

    await expect(app.appTitle()).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('aligns search button width with search input', async ({ page }) => {
    const search = new SearchPage(page);
    const firstBox = await search.searchInput().boundingBox();
    const secondBox = await search.searchButton().boundingBox();

    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    expect(secondBox!.width).toBeCloseTo(firstBox!.width, 0);
  });
});
