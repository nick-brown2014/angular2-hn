import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  navigateToNews() {
    return browser.get(`${browser.baseUrl.replace(/\/$/, '')}/news/1`) as Promise<any>;
  }

  getHeaderNavText() {
    return element(by.css('app-root app-header .header-nav')).getText() as Promise<string>;
  }

  getFirstStoryTitle() {
    return element.all(by.css('app-root app-feed item a.title')).first().getText() as Promise<string>;
  }

  waitForFeed() {
    return browser.wait(
      ExpectedConditions.presenceOf(element(by.css('app-root app-feed item'))),
      20000,
      'Timed out waiting for the feed to render'
    );
  }
}
