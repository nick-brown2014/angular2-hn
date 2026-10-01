import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions as EC } from 'protractor';

const WAIT_TIMEOUT = 20000;

export class AppPage {
  navigateTo(path = '') {
    return browser.get(browser.baseUrl + path) as Promise<unknown>;
  }

  currentPath() {
    return browser.getCurrentUrl().then(url => url.replace(browser.baseUrl, '/').replace(/\/\/+/, '/'));
  }

  waitForPath(pattern: RegExp) {
    return browser.wait(() => this.currentPath().then(path => pattern.test(path)), WAIT_TIMEOUT, `URL never matched ${pattern}`);
  }

  // Header

  get header(): ElementFinder {
    return element(by.css('app-header #header'));
  }

  get homeLink(): ElementFinder {
    return element(by.css('app-header a.home-link'));
  }

  headerNavLink(text: string): ElementFinder {
    return element(by.cssContainingText('app-header .header-nav a', text));
  }

  get footer(): ElementFinder {
    return element(by.css('app-footer #footer'));
  }

  // Feed

  get stories(): ElementArrayFinder {
    return element.all(by.css('app-feed ol li.post item'));
  }

  get storyTitles(): ElementArrayFinder {
    return element.all(by.css('app-feed item a.title'));
  }

  get firstStoryCommentsLink(): ElementFinder {
    return element.all(by.css('app-feed item .subtext-laptop a[href^="/item/"]')).first();
  }

  get firstStoryUserLink(): ElementFinder {
    return element.all(by.css('app-feed item .subtext-laptop a[href^="/user/"]')).first();
  }

  get moreLink(): ElementFinder {
    return element(by.css('app-feed .nav a.more'));
  }

  waitForStories() {
    return browser.wait(EC.presenceOf(this.stories.first()), WAIT_TIMEOUT, 'Feed stories never rendered');
  }

  // Item details

  get itemDetails(): ElementFinder {
    return element(by.css('app-item-details .item'));
  }

  get itemDetailsTitle(): ElementFinder {
    return element(by.css('app-item-details .laptop a.title'));
  }

  waitForItemDetails() {
    return browser.wait(EC.presenceOf(this.itemDetails), WAIT_TIMEOUT, 'Item details never rendered');
  }

  // User

  get userProfile(): ElementFinder {
    return element(by.css('app-user .profile'));
  }

  get userError(): ElementFinder {
    return element(by.css('app-user app-error-message'));
  }

  waitForUserPage() {
    return browser.wait(
      EC.or(EC.presenceOf(this.userProfile), EC.presenceOf(this.userError)),
      WAIT_TIMEOUT,
      'User page never finished loading'
    );
  }

  // Settings / theme

  get settingsCog(): ElementFinder {
    return element(by.css('app-header img.settings'));
  }

  get settingsPanel(): ElementFinder {
    return element(by.css('app-settings .popup'));
  }

  get closeSettingsButton(): ElementFinder {
    return element(by.css('app-settings .close'));
  }

  themeRadio(theme: string): ElementFinder {
    return element(by.css(`app-settings input[type="radio"][value="${theme}"]`));
  }

  get themeContainer(): ElementFinder {
    return element(by.css('app-root > div'));
  }

  themeClass() {
    return this.themeContainer.getAttribute('class') as Promise<string>;
  }

  clearStorage() {
    return browser.executeScript('window.localStorage.clear();') as Promise<unknown>;
  }
}
