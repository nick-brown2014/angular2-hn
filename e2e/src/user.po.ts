import { browser, by, element, ElementFinder } from 'protractor';

export class UserPage {
  navigateTo(id: string) {
    return browser.get(`/user/${id}`);
  }

  getUsername(): ElementFinder {
    return element(by.css('.name'));
  }

  getKarma(): ElementFinder {
    return element(by.css('.right'));
  }

  getBackButton(): ElementFinder {
    return element(by.css('.back-button'));
  }

  getCreatedDate(): ElementFinder {
    return element(by.css('.age'));
  }
}
