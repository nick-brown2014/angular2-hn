import { by, element, ElementArrayFinder, ElementFinder } from 'protractor';

import { AppPage, waitForElement } from './app.po';

export class ItemDetailsPage extends AppPage {
  async load(id: number) {
    await this.navigateTo(`item/${id}`);
    await this.waitForItem();
  }

  waitForItem() {
    return waitForElement(this.getItem(), 'item details did not load');
  }

  getItem(): ElementFinder {
    return element(by.css('app-item-details .item'));
  }

  getTitle(): ElementFinder {
    return element(by.css('app-item-details .laptop .title'));
  }

  getComments(): ElementArrayFinder {
    return element.all(by.css('app-item-details app-comment'));
  }

  getTopLevelComments(): ElementArrayFinder {
    return element.all(by.css('app-item-details ul.comment-list > li > app-comment'));
  }
}
