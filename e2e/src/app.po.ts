import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo(path = '/news/1') {
    return browser.get(browser.baseUrl + path) as Promise<any>;
  }

  getHeaderLinks(): ElementArrayFinder {
    return element.all(by.css('app-header .header-nav a'));
  }

  getFeedItems(): ElementArrayFinder {
    return element.all(by.css('app-feed li.post item'));
  }

  getFirstItemTitle(): ElementFinder {
    return this.getFeedItems().first().element(by.css('a.title'));
  }

  waitForFeed(timeout = 20000) {
    return browser.wait(
      ExpectedConditions.presenceOf(this.getFeedItems().first()),
      timeout,
      'the news feed did not render in time'
    );
  }
}
