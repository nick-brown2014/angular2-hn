import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions as EC } from 'protractor';

const WAIT_MS = 15000;

export class AppPage {
  navigateTo(path = '') {
    return browser.get(browser.baseUrl + path) as Promise<any>;
  }

  getCurrentUrl() {
    return browser.getCurrentUrl() as Promise<string>;
  }

  get header(): ElementFinder {
    return element(by.css('app-header #header'));
  }

  get headerNavLinks(): ElementArrayFinder {
    return element.all(by.css('app-header .header-nav a'));
  }

  get feedItems(): ElementArrayFinder {
    return element.all(by.css('app-feed li.post item'));
  }

  get itemDetails(): ElementFinder {
    return element(by.css('app-item-details .item'));
  }

  get settingsCog(): ElementFinder {
    return element(by.css('app-header img.settings'));
  }

  get settingsPopup(): ElementFinder {
    return element(by.css('app-settings .popup'));
  }

  get themeContainer(): ElementFinder {
    return element(by.css('app-root > div'));
  }

  themeRadio(theme: string): ElementFinder {
    return element(by.css(`app-settings input[name=theme][value=${theme}]`));
  }

  async waitForFeedItems() {
    await browser.wait(EC.presenceOf(this.feedItems.first()), WAIT_MS, 'Feed items did not load');
  }

  async waitForItemDetails() {
    await browser.wait(EC.presenceOf(this.itemDetails), WAIT_MS, 'Item details did not load');
  }

  /** The "N comments" link of the first non-job story, which always routes to item details. */
  firstCommentsLink(): ElementFinder {
    return element.all(by.css('app-feed li.post item .subtext-laptop a[href^="/item/"]')).first();
  }
}
