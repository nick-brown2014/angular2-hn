import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('angular-hnpwa App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('renders the header navigation', async () => {
    await page.navigateToNews();

    expect(await page.getHeaderNavText()).toContain('new');
  });

  it('renders stories on the news feed', async () => {
    await page.navigateToNews();
    await page.waitForFeed();

    expect((await page.getFirstStoryTitle()).length).toBeGreaterThan(0);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
