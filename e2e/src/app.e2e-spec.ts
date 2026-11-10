import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('angular2-hn App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('redirects the root URL to the first page of top stories', async () => {
    await page.navigateTo();

    expect(await page.getCurrentUrl()).toMatch(/\/news\/1$/);
  });

  it('renders the header with feed navigation', async () => {
    await page.navigateTo('news/1');

    expect(await page.header.isDisplayed()).toBe(true);
    expect(await page.headerNavLinks.getText()).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('loads story items on /news/1', async () => {
    await page.navigateTo('news/1');
    await page.waitForFeedItems();

    expect(await page.feedItems.count()).toBeGreaterThan(0);
    expect(await page.feedItems.first().$('a.title').getText()).not.toBe('');
  });

  it('navigates to item details when a story is clicked', async () => {
    await page.navigateTo('news/1');
    await page.waitForFeedItems();

    const link = page.firstCommentsLink();
    const href = await link.getAttribute('href');
    await link.click();
    await page.waitForItemDetails();

    const itemPath = href.replace(/^https?:\/\/[^/]+/, '');
    expect(await page.getCurrentUrl()).toContain(itemPath);
    expect(await page.itemDetails.$('.laptop .title').getText()).not.toBe('');
  });

  it('opens the settings popup and applies a theme', async () => {
    await page.navigateTo('news/1');

    expect(await page.settingsPopup.isPresent()).toBe(false);
    await page.settingsCog.click();

    expect(await page.settingsPopup.isDisplayed()).toBe(true);
    expect(await page.settingsPopup.$('h1').getText()).toBe('Settings');

    await page.themeRadio('night').click();
    expect(await page.themeContainer.getAttribute('class')).toBe('night');

    await page.themeRadio('default').click();
    await page.settingsPopup.$('.close').click();
    expect(await page.settingsPopup.isPresent()).toBe(false);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
