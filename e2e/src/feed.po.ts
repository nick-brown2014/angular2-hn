import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions as EC } from 'protractor';

export class FeedPage {
  list(): ElementFinder {
    return element(by.css('app-feed ol'));
  }

  items(): ElementArrayFinder {
    return element.all(by.css('app-feed li.post item'));
  }

  titles(): ElementArrayFinder {
    return element.all(by.css('app-feed li.post a.title'));
  }

  firstDiscussionLink(): ElementFinder {
    return element.all(by.css('app-feed li.post .subtext-laptop a[href^="/item/"]')).first();
  }

  firstAuthorLink(): ElementFinder {
    return element.all(by.css('app-feed li.post .subtext-laptop a[href^="/user/"]')).first();
  }

  moreLink(): ElementFinder {
    return element(by.css('app-feed .nav a.more'));
  }

  prevLink(): ElementFinder {
    return element(by.css('app-feed .nav a.prev'));
  }

  jobHeader(): ElementFinder {
    return element(by.css('app-feed .job-header'));
  }

  waitForItems(timeout = 20000) {
    return browser.wait(EC.presenceOf(this.items().first()), timeout, 'feed items did not load') as Promise<any>;
  }

  listStart() {
    return this.list().getAttribute('start') as Promise<string>;
  }
}
