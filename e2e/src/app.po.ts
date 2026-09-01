import { browser, by, element, ElementArrayFinder } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getCurrentUrl() {
    return browser.getCurrentUrl() as Promise<string>;
  }

  getHeaderNavLabels() {
    return element
      .all(by.css('app-header .header-nav a'))
      .map(link => link.getText()) as Promise<string[]>;
  }

  getFeedItems(): ElementArrayFinder {
    return element.all(by.css('app-feed li.post item'));
  }

  getFirstItemTitle() {
    return this.getFeedItems()
      .first()
      .element(by.css('a.title'))
      .getText() as Promise<string>;
  }

  getFooterText() {
    return element(by.css('app-footer #footer')).getText() as Promise<string>;
  }
}
