import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getHeader() {
    return element(by.css('app-root app-header #header'));
  }

  getNavLinkTexts(): Promise<string[]> {
    return element.all(by.css('app-header .header-nav a')).map(el => el.getText()) as Promise<string[]>;
  }

  getLogo() {
    return element(by.css('app-header a.home-link img.logo'));
  }

  getSettingsToggle() {
    return element(by.css('app-header img.settings'));
  }

  getSettingsPanel() {
    return element(by.css('app-settings .popup'));
  }

  getFooterText() {
    return element(by.css('app-footer #footer')).getText() as Promise<string>;
  }

  getStoryList() {
    return element(by.css('app-feed ol'));
  }

  getStories() {
    return element.all(by.css('app-feed li.post item'));
  }

  getStoryTitles(): Promise<string[]> {
    return element.all(by.css('app-feed li.post a.title')).map(el => el.getText()) as Promise<string[]>;
  }

  waitForFeed(timeout = 20000) {
    return browser.wait(ExpectedConditions.presenceOf(this.getStoryList()), timeout) as Promise<any>;
  }
}
