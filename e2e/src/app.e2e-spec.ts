import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

// Requests that are expected to fail and should not fail the run: the node-hnapi
// /user endpoint currently 404s upstream, and Google Analytics may be blocked.
const IGNORED_LOG_PATTERNS = [/node-hnapi\.herokuapp\.com\/user\//, /google-analytics\.com/];

describe('Angular 2 HN', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
    await page.clearStorage();
  });

  describe('home page', () => {
    it('redirects to the first page of top stories', async () => {
      await page.waitForPath(/^\/news\/1$/);
      expect(await page.currentPath()).toBe('/news/1');
    });

    it('renders the header and footer', async () => {
      expect(await page.header.isPresent()).toBe(true);
      expect(await page.homeLink.getAttribute('href')).toMatch(/\/news\/1$/);
      expect(await page.footer.getText()).toContain('GitHub');
    });

    it('renders a page of feed items', async () => {
      await page.waitForStories();

      expect(await page.stories.count()).toBeGreaterThan(0);
      expect(await page.storyTitles.first().getText()).not.toBe('');
    });

    it('paginates to the next page', async () => {
      await page.waitForStories();
      await page.moreLink.click();

      await page.waitForPath(/^\/news\/2$/);
      await page.waitForStories();
      expect(await page.stories.count()).toBeGreaterThan(0);
    });
  });

  describe('header navigation', () => {
    [
      { text: 'new', path: '/newest/1' },
      { text: 'show', path: '/show/1' },
      { text: 'ask', path: '/ask/1' },
      { text: 'jobs', path: '/jobs/1' }
    ].forEach(({ text, path }) => {
      it(`navigates to the ${text} feed`, async () => {
        await page.headerNavLink(text).click();

        await page.waitForPath(new RegExp(`^${path}$`));
        await page.waitForStories();
        expect(await page.stories.count()).toBeGreaterThan(0);
      });
    });
  });

  describe('item details', () => {
    it('opens the comments page for a story', async () => {
      await page.waitForStories();
      const href = await page.firstStoryCommentsLink.getAttribute('href');

      await page.firstStoryCommentsLink.click();

      await page.waitForPath(/^\/item\/\d+$/);
      expect(href).toContain(await page.currentPath());
      await page.waitForItemDetails();
      expect(await page.itemDetailsTitle.getText()).not.toBe('');
    });
  });

  describe('user page', () => {
    it('opens the profile page for a story author', async () => {
      await page.waitForStories();
      const userName = await page.firstStoryUserLink.getText();

      await page.firstStoryUserLink.click();

      await page.waitForPath(new RegExp(`^/user/${userName}$`));
      await page.waitForUserPage();
      if (await page.userProfile.isPresent()) {
        expect(await page.userProfile.getText()).toContain(userName);
      } else {
        expect(await page.userError.getText()).toContain(`Could not load user ${userName}.`);
      }
    });
  });

  describe('theme', () => {
    it('opens the settings panel and switches theme', async () => {
      expect(await page.settingsPanel.isPresent()).toBe(false);

      await page.settingsCog.click();
      expect(await page.settingsPanel.isDisplayed()).toBe(true);

      await page.themeRadio('night').click();
      expect(await page.themeClass()).toBe('night');

      await page.themeRadio('amoledblack').click();
      expect(await page.themeClass()).toBe('amoledblack');

      await page.closeSettingsButton.click();
      expect(await page.settingsPanel.isPresent()).toBe(false);
    });

    it('persists the selected theme across reloads', async () => {
      await page.settingsCog.click();
      await page.themeRadio('night').click();

      await page.navigateTo('news/1');

      expect(await page.themeClass()).toBe('night');
    });
  });

  afterEach(async () => {
    await page.clearStorage();
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    const severe = logs.filter(
      entry => entry.level === logging.Level.SEVERE && !IGNORED_LOG_PATTERNS.some(p => p.test(entry.message))
    );
    expect(severe).toEqual([]);
  });
});
