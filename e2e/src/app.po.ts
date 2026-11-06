import { browser, by, element, ElementFinder, ExpectedConditions as EC } from 'protractor';

export class AppPage {
  navigateTo(path = '') {
    return browser.get(browser.baseUrl + path) as Promise<any>;
  }

  currentPath() {
    return browser.getCurrentUrl().then(url => url.replace(/^https?:\/\/[^/]+/, '')) as Promise<string>;
  }

  waitForPath(pattern: RegExp, timeout = 10000) {
    return browser.wait(() => this.currentPath().then(path => pattern.test(path)), timeout,
      `URL did not match ${pattern}`);
  }

  title() {
    return browser.getTitle() as Promise<string>;
  }

  themeRoot(): ElementFinder {
    return element(by.css('app-root > div'));
  }

  homeLink(): ElementFinder {
    return element(by.css('#header a.home-link'));
  }

  navLink(text: string): ElementFinder {
    return element(by.cssContainingText('#header .header-nav a', text));
  }

  settingsCog(): ElementFinder {
    return element(by.css('#header img.settings'));
  }

  settingsPanel(): ElementFinder {
    return element(by.css('app-settings .popup'));
  }

  themeRadio(value: string): ElementFinder {
    return element(by.css(`app-settings input[type="radio"][value="${value}"]`));
  }

  closeSettings() {
    return element(by.css('app-settings .close')).click() as Promise<void>;
  }

  openSettings() {
    this.settingsCog().click();
    return browser.wait(EC.visibilityOf(this.settingsPanel()), 5000, 'settings panel did not open') as Promise<any>;
  }

  footerLink(): ElementFinder {
    return element(by.css('#footer a'));
  }
}
