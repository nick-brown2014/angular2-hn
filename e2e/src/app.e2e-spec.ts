import { browser, logging, ExpectedConditions as EC } from 'protractor';

import { AppPage } from './app.po';

// NOTE: These end-to-end tests hit the real Hacker News API
// (https://node-hnapi.herokuapp.com) and may be flaky if the upstream
// service is slow or unavailable. They are intended to be run against
// the locally-served app via `npm run e2e`.
describe('angular2-hn App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should redirect to the news feed on load', async () => {
    await page.navigateTo();
    await browser.wait(EC.urlContains('/news/1'), 10000);
    expect(await browser.getCurrentUrl()).toContain('/news/1');
  });

  it('should display feed items', async () => {
    await page.navigateTo();
    await browser.wait(async () => (await page.getFeedItems().count()) > 0, 15000);
    expect(await page.getFeedItems().count()).toBeGreaterThan(0);
  });

  it('should navigate between feed types', async () => {
    await page.navigateTo();
    await page.navigateToFeed('show');
    await browser.wait(EC.urlContains('/show/1'), 10000);
    expect(await browser.getCurrentUrl()).toContain('/show/1');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
