// These specs run against the live node-hnapi.herokuapp.com API, except /user/:id (stubbed in UserPage).
import { browser, logging } from 'protractor';

import { AppPage } from './app.po';
import { FeedPage } from './feed.po';
import { ItemDetailsPage } from './item-details.po';
import { UserPage } from './user.po';

describe('angular2-hn', () => {
  let app: AppPage;
  let feed: FeedPage;

  beforeEach(async () => {
    app = new AppPage();
    feed = new FeedPage();
    await app.navigateTo();
    await browser.executeScript('window.localStorage.clear()');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

  describe('app shell', () => {
    it('has the document title', async () => {
      expect(await app.title()).toBe('Angular 2 HN');
    });

    it('redirects the root URL to the first page of top stories', async () => {
      await app.waitForPath(/^\/news\/1$/);
      expect(await app.currentPath()).toBe('/news/1');
    });

    it('shows the GitHub link in the footer', async () => {
      expect(await app.footerLink().getAttribute('href')).toBe('https://github.com/hdjirdeh/angular2-hn');
    });
  });

  describe('feeds', () => {
    it('loads the top stories, numbered from 1', async () => {
      await feed.waitForItems();

      expect(await feed.items().count()).toBeGreaterThan(0);
      expect(await feed.listStart()).toBe('1');
      expect(await feed.titles().first().getText()).not.toBe('');
    });

    for (const [text, path] of [['new', 'newest'], ['show', 'show'], ['ask', 'ask'], ['jobs', 'jobs']]) {
      it(`navigates to the ${path} feed from the "${text}" header link`, async () => {
        await feed.waitForItems();
        await app.navLink(text).click();

        await app.waitForPath(new RegExp(`^/${path}/1$`));
        await feed.waitForItems();
        expect(await app.navLink(text).getAttribute('class')).toContain('active');
        expect(await feed.jobHeader().isPresent()).toBe(path === 'jobs');
      });
    }

    it('returns to top stories from the logo', async () => {
      await app.navigateTo('show/1');
      await feed.waitForItems();

      await app.homeLink().click();
      await app.waitForPath(/^\/news\/1$/);
      await feed.waitForItems();
    });

    it('pages forward with "More" and back with "Prev"', async () => {
      await feed.waitForItems();
      expect(await feed.prevLink().isPresent()).toBe(false);

      await feed.moreLink().click();
      await app.waitForPath(/^\/news\/2$/);
      await feed.waitForItems();
      expect(await feed.listStart()).toBe('31');

      await feed.prevLink().click();
      await app.waitForPath(/^\/news\/1$/);
      await feed.waitForItems();
      expect(await feed.listStart()).toBe('1');
    });
  });

  describe('item details', () => {
    it('opens a story\'s discussion and goes back to the feed', async () => {
      const details = new ItemDetailsPage();
      await feed.waitForItems();
      const link = feed.firstDiscussionLink();
      const itemPath = await link.getAttribute('pathname');

      await link.click();
      await app.waitForPath(new RegExp(`^${itemPath}$`));
      await details.waitForItem();
      expect(await details.title().getText()).not.toBe('');
      expect(await details.subtext().getText()).toMatch(/points by/);

      await browser.navigate().back();
      await app.waitForPath(/^\/news\/1$/);
      await feed.waitForItems();
    });
  });

  describe('user profile', () => {
    it('opens the author\'s profile from the feed', async () => {
      const user = new UserPage();
      await feed.waitForItems();
      const link = feed.firstAuthorLink();
      const author = await link.getText();

      await user.stubUserApi({ id: author, created: '10 years ago', karma: 1234, about: '<p>Hello from e2e</p>' });
      await link.click();

      await app.waitForPath(new RegExp(`^/user/${author}$`));
      await user.waitForProfile();
      expect(await user.name().getText()).toBe(author);
      expect(await user.karma().getText()).toBe('1234 ★');
      expect(await user.created().getText()).toBe('Created 10 years ago');
      expect(await user.about().getText()).toBe('Hello from e2e');
    });
  });

  describe('settings', () => {
    it('opens and closes the settings panel', async () => {
      await app.openSettings();
      expect(await app.settingsPanel().isDisplayed()).toBe(true);

      await app.closeSettings();
      expect(await app.settingsPanel().isPresent()).toBe(false);
    });

    it('switches theme and keeps it after a reload', async () => {
      await app.openSettings();
      await app.themeRadio('amoledblack').click();
      expect(await app.themeRoot().getAttribute('class')).toBe('amoledblack');

      await app.navigateTo();
      await feed.waitForItems();
      expect(await app.themeRoot().getAttribute('class')).toBe('amoledblack');
    });
  });
});
