import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('Angular 2 HN', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should have the app title', async () => {
    await page.navigateTo();
    expect(await page.getDocumentTitle()).toEqual('Angular 2 HN');
  });

  it('should redirect the root url to the first news page', async () => {
    await page.navigateTo();
    expect(await page.getCurrentPath()).toEqual('/news/1');
  });

  it('should display the header with feed navigation and the footer', async () => {
    await page.navigateTo();

    expect(await page.getHeader().isPresent()).toBe(true);
    expect(await page.getHomeLink().getAttribute('href')).toMatch(/\/news\/1$/);
    expect(await page.getNavLinks().getText()).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(await page.getFooter().getText()).toContain('GitHub');
  });

  it('should load feed items', async () => {
    await page.navigateTo('news/1');
    await page.waitForFeedItems();

    expect(await page.getFeedItems().count()).toBeGreaterThan(0);
    expect(await page.getFeedItemTitle(0).getText()).not.toEqual('');
  });

  it('should navigate between feeds using the header links', async () => {
    await page.navigateTo('news/1');

    await page.getNavLink('show').click();
    expect(await page.getCurrentPath()).toEqual('/show/1');
    await page.waitForFeedItems();
    expect(await page.getFeedItems().count()).toBeGreaterThan(0);

    await page.getHomeLink().click();
    expect(await page.getCurrentPath()).toEqual('/news/1');
  });

  it('should open and close the settings panel', async () => {
    await page.navigateTo();
    expect(await page.getSettingsPanel().isPresent()).toBe(false);

    await page.getSettingsCog().click();
    expect(await page.getSettingsPanel().isDisplayed()).toBe(true);

    await page.getSettingsCloseButton().click();
    expect(await page.getSettingsPanel().isPresent()).toBe(false);
  });

  it('should navigate to an item and back to the feed', async () => {
    await page.navigateTo('news/1');
    await page.waitForFeedItems();

    const commentsLink = page.getFeedItemCommentsLink(0);
    const itemPath = (await commentsLink.getAttribute('href')).replace(/^https?:\/\/[^/]+/, '');
    await commentsLink.click();

    expect(await page.getCurrentPath()).toEqual(itemPath);
    await page.waitForItemDetails();
    expect(await page.getItemDetailsTitle().getText()).not.toEqual('');

    await browser.navigate().back();
    expect(await page.getCurrentPath()).toEqual('/news/1');
    await page.waitForFeedItems();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
