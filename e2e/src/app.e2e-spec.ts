import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('angular-hnpwa App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display the header navigation', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('new | show | ask | jobs');
  });

  it('should link the logo to the news feed', () => {
    page.navigateTo();
    expect(page.getHomeLink().getAttribute('href')).toContain('/news/1');
  });

  it('should display the footer', () => {
    page.navigateTo();
    expect(page.getFooterText()).toContain('GitHub');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
