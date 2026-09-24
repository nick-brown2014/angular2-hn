import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('Angular HN PWA', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should render the header navigation', async () => {
    await page.navigateTo();
    expect(await page.getHomeLink().isPresent()).toBe(true);
    expect(await page.getHeaderNavLinks().getText()).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(await page.getHeaderNavText()).toEqual('new | show | ask | jobs');
  });

  it('should redirect the root url to the first news page', async () => {
    await page.navigateTo();
    expect(await browser.getCurrentUrl()).toContain('/news/1');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
