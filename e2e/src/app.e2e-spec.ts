import { AppPage } from './app.po';
import { browser, by, logging } from 'protractor';

// node-hnapi's /user endpoint currently responds 404 for every user, which the app handles with an error message.
const KNOWN_EXTERNAL_API_ERRORS = [/node-hnapi\.herokuapp\.com\/user\/\S+ - Failed to load resource: .*404/];

describe('Angular HN PWA', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  describe('app shell', () => {
    beforeEach(async () => {
      await page.navigateTo();
    });

    it('should redirect to the first page of the news feed', async () => {
      await page.waitForUrl('/news/1');
      expect(await page.getCurrentUrl()).toMatch(/\/news\/1$/);
    });

    it('should render the header with feed navigation', async () => {
      expect(await page.getHeader().isDisplayed()).toBe(true);
      expect(await page.getHomeLink().getAttribute('href')).toMatch(/\/news\/1$/);
      expect(await page.getNavLinks().getText()).toEqual(['new', 'show', 'ask', 'jobs']);
    });

    it('should render the footer', async () => {
      expect(await page.getFooter().getText()).toContain('GitHub');
    });

    it('should render the list of stories', async () => {
      await page.waitForFeed();
      expect(await page.getFeedItems().count()).toBeGreaterThan(0);
      expect(await page.getFeedItems().first().element(by.css('a.title')).getText()).not.toBe('');
    });

    it('should open and close the settings panel', async () => {
      await page.getSettingsButton().click();
      expect(await page.getSettingsPanel().isPresent()).toBe(true);

      await page.getSettingsPanel().element(by.css('.close')).click();
      expect(await page.getSettingsPanel().isPresent()).toBe(false);
    });
  });

  describe('navigation', () => {
    beforeEach(async () => {
      await page.navigateTo('/news/1');
      await page.waitForFeed();
    });

    it('should navigate between feeds from the header', async () => {
      await page.getNavLinks().get(0).click();
      await page.waitForUrl('/newest/1');
      await page.waitForFeed();

      expect(await page.getFeedItems().count()).toBeGreaterThan(0);
    });

    it('should navigate to the item details page', async () => {
      const commentsHref = await page.getFirstItemCommentsLink().getAttribute('href');

      await page.getFirstItemCommentsLink().click();
      await page.waitForUrl(commentsHref.replace(/^https?:\/\/[^/]+/, ''));
      await page.waitForPresence(page.getItemDetailsTitle());

      expect(await page.getItemDetailsTitle().getText()).not.toBe('');
    });

    it('should navigate to the user page', async () => {
      const userHref = await page.getFirstItemUserLink().getAttribute('href');

      await page.getFirstItemUserLink().click();
      await page.waitForUrl(userHref.replace(/^https?:\/\/[^/]+/, ''));
      await page.waitForPresence(page.getUserProfileOrError());

      expect(await page.getUserPage().isPresent()).toBe(true);
    });
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = (await browser.manage().logs().get(logging.Type.BROWSER))
      .filter(entry => !KNOWN_EXTERNAL_API_ERRORS.some(pattern => pattern.test(entry.message)));
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
