import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions as EC } from 'protractor';

const LOAD_TIMEOUT = 20000;

export class AppPage {
  navigateTo(path = '') {
    return browser.get(browser.baseUrl + path) as Promise<any>;
  }

  getDocumentTitle() {
    return browser.getTitle() as Promise<string>;
  }

  getCurrentPath() {
    return browser.getCurrentUrl().then(url => url.replace(browser.baseUrl, '/')) as Promise<string>;
  }

  getHeader(): ElementFinder {
    return element(by.css('app-header #header'));
  }

  getHomeLink(): ElementFinder {
    return element(by.css('app-header a.home-link'));
  }

  getNavLinks(): ElementArrayFinder {
    return element.all(by.css('app-header .header-nav a'));
  }

  getNavLink(text: string): ElementFinder {
    return element(by.cssContainingText('app-header .header-nav a', text));
  }

  getSettingsCog(): ElementFinder {
    return element(by.css('app-header img.settings'));
  }

  getSettingsPanel(): ElementFinder {
    return element(by.css('app-settings .popup'));
  }

  getSettingsCloseButton(): ElementFinder {
    return element(by.css('app-settings .close'));
  }

  getFooter(): ElementFinder {
    return element(by.css('app-footer #footer'));
  }

  getFeedItems(): ElementArrayFinder {
    return element.all(by.css('app-feed ol li.post'));
  }

  getFeedItemTitle(index: number): ElementFinder {
    return this.getFeedItems().get(index).element(by.css('a.title'));
  }

  getFeedItemCommentsLink(index: number): ElementFinder {
    return this.getFeedItems().get(index).element(by.css('.subtext-laptop a[href^="/item/"]'));
  }

  getItemDetailsTitle(): ElementFinder {
    return element(by.css('app-item-details .laptop a.title'));
  }

  waitForFeedItems() {
    return browser.wait(EC.presenceOf(this.getFeedItems().first()), LOAD_TIMEOUT, 'Feed items did not load');
  }

  waitForItemDetails() {
    return browser.wait(EC.presenceOf(this.getItemDetailsTitle()), LOAD_TIMEOUT, 'Item details did not load');
  }
}
