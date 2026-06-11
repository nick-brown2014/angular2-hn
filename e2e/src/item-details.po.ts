import { browser, by, element, ElementFinder, ElementArrayFinder } from 'protractor';

export class ItemDetailsPage {
  navigateTo(id: number) {
    return browser.get(`/item/${id}`);
  }

  getTitle(): ElementFinder {
    return element(by.css('.title'));
  }

  getBackButton(): ElementFinder {
    return element(by.css('.back-button'));
  }

  getComments(): ElementArrayFinder {
    return element.all(by.css('app-comment'));
  }

  getSubtext(): ElementFinder {
    return element(by.css('.subtext'));
  }
}
