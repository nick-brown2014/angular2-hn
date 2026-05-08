import { browser, by, element, ElementArrayFinder } from 'protractor';

export class AppPage {
  navigateTo(path: string = '') {
    // browser.baseUrl in protractor.conf.js already has a trailing slash, so the
    // default path is empty to avoid producing a double-slash URL.
    return browser.get(browser.baseUrl + path) as Promise<any>;
  }

  getHeaderText() {
    return element(by.css('app-root header .header-nav')).getText() as Promise<string>;
  }

  getFeedItems(): ElementArrayFinder {
    return element.all(by.css('app-root ol.list-margin > li.post, app-root ol > li.post'));
  }

  navigateToFeed(type: 'newest' | 'show' | 'ask' | 'jobs') {
    return element(by.css(`app-root header a[href="/${type}/1"]`)).click() as Promise<any>;
  }
}
