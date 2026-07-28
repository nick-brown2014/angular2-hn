import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('angular-hnpwa App', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  it('should redirect the root route to the news feed', async () => {
    expect(await page.getCurrentUrl()).toContain('/news/1');
  });

  it('should render the app shell header', async () => {
    expect(await page.getHeader().isPresent()).toBe(true);
  });

  it('should render at least one story', async () => {
    await page.waitForFirstItem();
    expect(await page.getFirstItemTitle().getText()).toBeTruthy();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
