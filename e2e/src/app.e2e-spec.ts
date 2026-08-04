import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('angular-hnpwa App', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo('/news/1');
    await page.waitForFeed();
  });

  it('renders the feed navigation', async () => {
    expect(await page.getHeaderLinks().getText()).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('renders stories on the news feed', async () => {
    expect(await page.getFeedItems().count()).toBeGreaterThan(0);
    expect(await page.getFirstItemTitle().getText()).toBeTruthy();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser
      .manage()
      .logs()
      .get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE
      } as logging.Entry)
    );
  });
});
