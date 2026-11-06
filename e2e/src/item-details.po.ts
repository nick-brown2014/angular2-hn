import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions as EC } from 'protractor';

export class ItemDetailsPage {
  container(): ElementFinder {
    return element(by.css('app-item-details .item'));
  }

  title(): ElementFinder {
    return element(by.css('app-item-details .laptop a.title'));
  }

  subtext(): ElementFinder {
    return element(by.css('app-item-details .laptop .subtext'));
  }

  comments(): ElementArrayFinder {
    return element.all(by.css('app-item-details .comment-list > li > app-comment'));
  }

  waitForItem(timeout = 20000) {
    return browser.wait(EC.presenceOf(this.container()), timeout, 'item details did not load') as Promise<any>;
  }
}
