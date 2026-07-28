import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo() {
    // The root route redirects to news/1
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getHeader() {
    return element(by.css('app-root app-header'));
  }

  getFirstItemTitle() {
    return element.all(by.css('item .title')).first();
  }

  waitForFirstItem() {
    return browser.wait(ExpectedConditions.presenceOf(this.getFirstItemTitle()), 20000);
  }

  getCurrentUrl() {
    return browser.getCurrentUrl() as Promise<string>;
  }
}
