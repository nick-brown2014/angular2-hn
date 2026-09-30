import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions } from 'protractor';

const WAIT_TIMEOUT = 20000;

export class AppPage {
  navigateTo(path = '/') {
    return browser.get(browser.baseUrl.replace(/\/$/, '') + path) as Promise<unknown>;
  }

  getCurrentUrl() {
    return browser.getCurrentUrl() as Promise<string>;
  }

  getHeader(): ElementFinder {
    return element(by.css('app-root app-header #header'));
  }

  getHomeLink(): ElementFinder {
    return element(by.css('app-header a.home-link'));
  }

  getNavLinks(): ElementArrayFinder {
    return element.all(by.css('app-header .header-nav a'));
  }

  getSettingsButton(): ElementFinder {
    return element(by.css('app-header img.settings'));
  }

  getSettingsPanel(): ElementFinder {
    return element(by.css('app-settings .popup'));
  }

  getFooter(): ElementFinder {
    return element(by.css('app-root app-footer #footer'));
  }

  getFeedItems(): ElementArrayFinder {
    return element.all(by.css('app-feed ol li.post'));
  }

  getFirstItemTitle(): ElementFinder {
    return this.getFeedItems().first().element(by.css('a.title'));
  }

  getFirstItemCommentsLink(): ElementFinder {
    return element.all(by.css('app-feed .subtext-laptop a[href^="/item/"]')).first();
  }

  getFirstItemUserLink(): ElementFinder {
    return element.all(by.css('app-feed .subtext-laptop a[href^="/user/"]')).first();
  }

  getItemDetailsTitle(): ElementFinder {
    return element(by.css('app-item-details .laptop .title'));
  }

  getUserPage(): ElementFinder {
    return element(by.css('app-user'));
  }

  getUserProfileOrError(): ElementFinder {
    return element(by.css('app-user .profile, app-user app-error-message'));
  }

  waitForPresence(finder: ElementFinder) {
    return browser.wait(ExpectedConditions.presenceOf(finder), WAIT_TIMEOUT) as Promise<unknown>;
  }

  waitForFeed() {
    return this.waitForPresence(this.getFeedItems().first());
  }

  waitForFirstItemTitleToChange(previousTitle: string) {
    return browser.wait(async () => (await this.getFirstItemTitle().getText()) !== previousTitle, WAIT_TIMEOUT) as Promise<unknown>;
  }

  waitForUrl(fragment: string) {
    return browser.wait(ExpectedConditions.urlContains(fragment), WAIT_TIMEOUT) as Promise<unknown>;
  }
}
