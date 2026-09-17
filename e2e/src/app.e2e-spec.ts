import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should render the header with feed navigation links', async () => {
    await page.navigateTo();
    expect(await page.getHeader().isPresent()).toBe(true);
    expect(await page.getNavLinkTexts()).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
