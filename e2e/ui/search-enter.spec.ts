import { test, expect } from '../fixtures/test';
import { mockTracks } from '../fixtures/spotify-mocks';
import { SearchPage } from '../pages';

test.describe('Search on Enter', () => {
  test('searches for tracks when Enter is pressed in the search input', async ({
    page,
  }) => {
    const search = new SearchPage(page);
    const searchRequest = page.waitForRequest('**/api.spotify.com/v1/search*');

    await search.submitSearchWithEnter('test song');
    const request = await searchRequest;

    expect(new URL(request.url()).searchParams.get('q')).toBe('test song');
    await expect(search.trackName('track-1')).toHaveText(mockTracks[0].name);
    await expect(search.resultsHeading()).toBeVisible();
  });
});
