import { test, expect } from '../../fixtures/test';
import {
  expectMatchingControlWidths,
  expectNoHorizontalOverflow,
} from '../../fixtures/helpers';

test.describe('Mobile layout', () => {
  test('loads without horizontal overflow', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Jamming' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('aligns search button width with search input', async ({ page }) => {
    await expectMatchingControlWidths(page, 'search-by-input', 'search-button');
  });
});
