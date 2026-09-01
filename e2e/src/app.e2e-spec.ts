import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display the feed navigation in the header', async () => {
    await page.navigateTo();

    const navText = await page.getHeaderNavText();

    expect(navText).toContain('new');
    expect(navText).toContain('show');
    expect(navText).toContain('ask');
    expect(navText).toContain('jobs');
  });

  it('should link home to the top news feed', async () => {
    await page.navigateTo();

    expect(await page.getHomeLink().getAttribute('href')).toContain('/news/1');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
