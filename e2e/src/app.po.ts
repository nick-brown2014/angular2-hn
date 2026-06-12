import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getHeaderNavText() {
    return element(by.css('.header-nav')).getText() as Promise<string>;
  }

  getStoryItems() {
    return element.all(by.css('item'));
  }
}
