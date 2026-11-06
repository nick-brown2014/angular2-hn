import { browser, by, element, ElementFinder, ExpectedConditions as EC } from 'protractor';

export class UserPage {
  profile(): ElementFinder {
    return element(by.css('app-user .profile'));
  }

  name(): ElementFinder {
    return element(by.css('app-user .main-details .name'));
  }

  karma(): ElementFinder {
    return element(by.css('app-user .main-details .right'));
  }

  created(): ElementFinder {
    return element(by.css('app-user .main-details .age'));
  }

  about(): ElementFinder {
    return element(by.css('app-user .other-details'));
  }

  waitForProfile(timeout = 10000) {
    return browser.wait(EC.presenceOf(this.profile()), timeout, 'user profile did not load') as Promise<any>;
  }

  /**
   * node-hnapi's /user/:id endpoint currently 404s for every user, so answer just that request with a fixture.
   * Must be called after the app has loaded, and only lasts until the next full page load.
   */
  stubUserApi(user: object) {
    return browser.executeScript((json: string) => {
      const proto = XMLHttpRequest.prototype;
      const open = proto.open;
      const send = proto.send;
      proto.open = function(method: string, url: string) {
        this.__stubbed = /node-hnapi\.herokuapp\.com\/user\//.test(url);
        return open.apply(this, arguments);
      } as any;
      proto.send = function() {
        if (!this.__stubbed) {
          return send.apply(this, arguments);
        }
        Object.defineProperty(this, 'status', { value: 200 });
        Object.defineProperty(this, 'responseText', { value: json });
        setTimeout(() => this.onload());
      };
    }, JSON.stringify(user)) as Promise<any>;
  }
}
