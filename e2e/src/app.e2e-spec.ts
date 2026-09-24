import { AppPage } from './app.po';
import { browser, by, logging } from 'protractor';

describe('Angular HN PWA', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  it('redirects to the first page of the news feed', async () => {
    expect(await browser.getCurrentUrl()).toContain('/news/1');
  });

  it('renders the header with logo and feed navigation', async () => {
    expect(await page.getHeader().isPresent()).toBe(true);
    expect(await page.getLogo().isPresent()).toBe(true);
    expect(await page.getNavLinkTexts()).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('renders the footer', async () => {
    expect(await page.getFooterText()).toContain('GitHub');
  });

  it('loads a list of stories into the news feed', async () => {
    await page.waitForFeed();
    expect(await page.getStoryList().isPresent()).toBe(true);
    expect(await page.getStories().count()).toBeGreaterThan(0);

    const titles = await page.getStoryTitles();
    expect(titles.length).toBeGreaterThan(0);
    titles.forEach(title => expect(title.trim().length).toBeGreaterThan(0));
  });

  it('opens and closes the settings panel from the header', async () => {
    expect(await page.getSettingsPanel().isPresent()).toBe(false);
    await page.getSettingsToggle().click();
    expect(await page.getSettingsPanel().isPresent()).toBe(true);
    await page.getSettingsPanel().element(by.css('.close')).click();
    expect(await page.getSettingsPanel().isPresent()).toBe(false);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
