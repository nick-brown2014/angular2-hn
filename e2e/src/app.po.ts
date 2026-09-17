import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getHeader() {
    return element(by.css('app-root app-header #header'));
  }

  getNavLinkTexts() {
    return element.all(by.css('app-root app-header .header-nav a')).getText() as unknown as Promise<string[]>;
  }
}
