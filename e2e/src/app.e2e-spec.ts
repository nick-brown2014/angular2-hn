import { AppPage } from './app.po';
import { browser, by, element, logging, ExpectedConditions } from 'protractor';

describe('angular2-hn App', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  it('redirects the root url to the first page of news', async () => {
    expect(await page.getCurrentUrl()).toMatch(/\/news\/1$/);
  });

  it('renders the header navigation', async () => {
    expect(await page.getHeaderNavLabels()).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('renders the footer', async () => {
    expect(await page.getFooterText()).toContain('GitHub');
  });

  it('renders the news feed once it loads', async () => {
    const items = page.getFeedItems();
    const errorMessage = element(by.css('app-error-message'));

    // the feed is fetched from the public hnapi, so accept a rendered error too
    await browser.wait(
      ExpectedConditions.or(
        () => items.count().then(count => count > 0),
        ExpectedConditions.presenceOf(errorMessage)
      ),
      20000,
      'the feed neither loaded nor reported an error'
    );

    if (await errorMessage.isPresent()) {
      pending('hnapi was unreachable, the feed rendered its error state');
      return;
    }

    expect(await items.count()).toBeGreaterThan(0);
    expect(await page.getFirstItemTitle()).toBeTruthy();
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
