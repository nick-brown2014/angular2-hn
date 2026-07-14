import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getHeaderNavText() {
    return element(by.css('app-root app-header .header-nav')).getText() as Promise<string>;
  }
}
