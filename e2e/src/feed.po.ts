import { browser, by, element, ElementFinder, ElementArrayFinder } from 'protractor';

export class FeedPage {
  navigateTo(feedType: string = 'news', page: number = 1) {
    return browser.get(`/${feedType}/${page}`);
  }

  getItemsList(): ElementArrayFinder {
    return element.all(by.css('ol li'));
  }

  getItemTitles(): ElementArrayFinder {
    return element.all(by.css('.title'));
  }

  getMoreLink(): ElementFinder {
    return element(by.css('a.more'));
  }

  getPrevLink(): ElementFinder {
    return element(by.css('a.prev'));
  }

  getJobHeader(): ElementFinder {
    return element(by.css('.job-header'));
  }
}
