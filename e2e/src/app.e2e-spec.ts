import { browser, logging } from 'protractor';

import { currentPath, FeedPage, ItemDetailsPage, stubUserEndpoint, UserPage, waitForPath } from './app.po';

// These specs run against the live node-hnapi.herokuapp.com feed and item endpoints;
// only the broken /user/:id endpoint is stubbed (see stubUserEndpoint).
describe('Angular 2 HN', () => {
  let feed: FeedPage;
  let itemDetails: ItemDetailsPage;
  let userPage: UserPage;

  beforeEach(() => {
    feed = new FeedPage();
    itemDetails = new ItemDetailsPage();
    userPage = new UserPage();
  });

  it('redirects the root URL to the first news page', async () => {
    await feed.navigateTo('/');
    expect(await waitForPath(/^\/news\/1$/)).toBe('/news/1');
    expect(await browser.getTitle()).toBe('Angular 2 HN');
  });

  it('loads and displays story items on the feed page', async () => {
    await feed.navigateTo('/news/1');
    await feed.waitForStories();

    expect(await feed.stories.count()).toBeGreaterThan(0);
    const firstTitle = await feed.storyTitles.first().getText();
    expect(firstTitle.trim().length).toBeGreaterThan(0);
    expect(await feed.commentLinks.count()).toBeGreaterThan(0);
  });

  it('navigates between feeds from the header', async () => {
    await feed.navigateTo('/news/1');
    await feed.waitForStories();

    await feed.navLink('new').click();
    expect(await waitForPath(/^\/newest\/1$/)).toBe('/newest/1');
    await feed.waitForStories();
    expect(await feed.stories.count()).toBeGreaterThan(0);
  });

  it('opens the item details page when a story is clicked', async () => {
    await feed.navigateTo('/news/1');
    await feed.waitForStories();

    const link = feed.commentLinks.first();
    const href = await link.getAttribute('href');
    const itemPath = href.replace(/^https?:\/\/[^/]+/, '');
    expect(itemPath).toMatch(/^\/item\/\d+$/);

    await link.click();
    expect(await waitForPath(/^\/item\/\d+$/)).toBe(itemPath);

    await itemDetails.waitForItem();
    expect((await itemDetails.title.getText()).trim().length).toBeGreaterThan(0);
    expect(await itemDetails.subtext.getText()).toMatch(/\d+ points by \S+/);
  });

  it('opens the user profile page when a user is clicked', async () => {
    await feed.navigateTo('/news/1');
    await feed.waitForStories();
    await stubUserEndpoint({ id: '', karma: 1234, created: '5 years ago', about: 'Hello from e2e' });

    const link = feed.userLinks.first();
    const username = (await link.getText()).trim();
    await link.click();

    expect(await waitForPath(/^\/user\//)).toBe(`/user/${username}`);
    await userPage.waitForProfile();
    expect(await userPage.name.getText()).toBe(username);
    expect(await userPage.karma.getText()).toBe('1234 ★');
    expect(await userPage.created.getText()).toBe('Created 5 years ago');
    expect(await userPage.about.getText()).toBe('Hello from e2e');
    expect(await currentPath()).toBe(`/user/${username}`);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
