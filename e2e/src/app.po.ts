import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions as EC } from 'protractor';

const WAIT_TIMEOUT = 15000;

export function waitForElement(el: ElementFinder, message: string) {
  return browser.wait(EC.presenceOf(el), WAIT_TIMEOUT, message);
}

export class AppPage {
  navigateTo(path = '') {
    return browser.get(browser.baseUrl + path) as Promise<unknown>;
  }

  getDocumentTitle() {
    return browser.getTitle() as Promise<string>;
  }

  getCurrentUrl() {
    return browser.getCurrentUrl() as Promise<string>;
  }

  getThemeWrapper(): ElementFinder {
    return element(by.css('app-root > div'));
  }

  getHeaderNavLinks(): ElementArrayFinder {
    return element.all(by.css('app-header .header-nav a'));
  }

  getFooter(): ElementFinder {
    return element(by.css('app-footer #footer'));
  }

  clearLocalStorage() {
    return browser.executeScript('window.localStorage.clear();');
  }
}
