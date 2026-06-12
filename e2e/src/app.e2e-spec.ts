import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('angular-hnpwa App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display header navigation links', () => {
    page.navigateTo();
    expect(page.getHeaderNavText()).toContain('new');
    expect(page.getHeaderNavText()).toContain('show');
    expect(page.getHeaderNavText()).toContain('ask');
    expect(page.getHeaderNavText()).toContain('jobs');
  });

  it('should display a list of stories', () => {
    page.navigateTo();
    expect(page.getStoryItems().count()).toBeGreaterThan(0);
  });

  afterEach(async () => {
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
