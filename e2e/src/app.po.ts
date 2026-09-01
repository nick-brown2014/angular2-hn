import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getHeaderNavText() {
    return element(by.css('app-root header .header-nav')).getText() as Promise<string>;
  }

  getHomeLink() {
    return element(by.css('app-root header a.home-link'));
  }
}
