import { test, expect } from '../../fixtures/test';
import { hasHorizontalOverflow } from '../../fixtures/helpers';

test.describe('Mobile layout', () => {
  test('loads without horizontal overflow', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Jamming' })).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('aligns search button width with search input', async ({ page }) => {
    const firstBox = await page.getByTestId('search-by-input').boundingBox();
    const secondBox = await page.getByTestId('search-button').boundingBox();

    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    expect(secondBox!.width).toBeCloseTo(firstBox!.width, 0);
  });
});
