import { browser, by, element, ElementFinder } from 'protractor';

import { AppPage, waitForElement } from './app.po';

export interface UserFixture {
  id: string;
  created: string;
  karma: number;
  about: string;
}

export class UserPage extends AppPage {
  /**
   * Answers the app's `/user/:id` XHRs with a fixture so the profile page can be
   * exercised regardless of the public API's availability. Must be called after the
   * app has bootstrapped; it only lasts until the next full page load.
   */
  stubUserApi(user: UserFixture) {
    return browser.executeScript(
      (fixture: UserFixture) => {
        const body = 'data:application/json,' + encodeURIComponent(JSON.stringify(fixture));
        const open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function() {
          const args = Array.prototype.slice.call(arguments);
          if (/\/user\/[^/?#]+$/.test(args[1])) {
            args[1] = body;
          }
          return open.apply(this, args);
        };
      },
      user
    );
  }

  waitForProfile() {
    return waitForElement(this.getProfile(), 'user profile did not load');
  }

  getProfile(): ElementFinder {
    return element(by.css('app-user .profile'));
  }

  getName(): ElementFinder {
    return element(by.css('app-user .main-details .name'));
  }

  getKarma(): ElementFinder {
    return element(by.css('app-user .main-details .right'));
  }

  getCreated(): ElementFinder {
    return element(by.css('app-user .main-details .age'));
  }

  getAbout(): ElementFinder {
    return element(by.css('app-user .other-details'));
  }
}
