import { browser, by, element, ElementArrayFinder, ElementFinder, ExpectedConditions as EC } from 'protractor';

const TIMEOUT = 20000;

async function waitFor(el: ElementFinder): Promise<ElementFinder> {
  await browser.wait(EC.presenceOf(el), TIMEOUT, `Timed out waiting for ${el.locator()}`);
  return el;
}

export async function currentPath(): Promise<string> {
  const url = await browser.getCurrentUrl();
  return url.replace(/^https?:\/\/[^/]+/, '');
}

export async function waitForPath(pattern: RegExp): Promise<string> {
  await browser.wait(async () => pattern.test(await currentPath()), TIMEOUT, `URL never matched ${pattern}`);
  return currentPath();
}

export class FeedPage {
  readonly stories: ElementArrayFinder = element.all(by.css('ol li.post item'));
  readonly storyTitles: ElementArrayFinder = element.all(by.css('ol li.post item a.title'));
  readonly commentLinks: ElementArrayFinder = element.all(by.css('ol li.post item .subtext-laptop .item-details a'));
  readonly userLinks: ElementArrayFinder = element.all(by.css('ol li.post item .subtext-laptop a[href^="/user/"]'));
  readonly moreLink: ElementFinder = element(by.css('.nav a.more'));

  navigateTo(path = '/') {
    return browser.get(path) as Promise<any>;
  }

  navLink(text: string): ElementFinder {
    return element(by.cssContainingText('#header .header-nav a', text));
  }

  async waitForStories(): Promise<void> {
    await waitFor(this.stories.first());
  }
}

export class ItemDetailsPage {
  readonly title: ElementFinder = element(by.css('.item .laptop a.title'));
  readonly subtext: ElementFinder = element(by.css('.item .laptop .subtext'));
  readonly comments: ElementArrayFinder = element.all(by.css('ul.comment-list > li > app-comment'));

  async waitForItem(): Promise<void> {
    await waitFor(this.title);
  }
}

export class UserPage {
  readonly name: ElementFinder = element(by.css('.profile .main-details .name'));
  readonly karma: ElementFinder = element(by.css('.profile .main-details .right'));
  readonly created: ElementFinder = element(by.css('.profile .main-details .age'));
  readonly about: ElementFinder = element(by.css('.profile .other-details'));

  async waitForProfile(): Promise<void> {
    await waitFor(this.name);
  }
}

export interface StubUser {
  id: string;
  karma: number;
  created: string;
  about: string;
}

/**
 * node-hnapi's /user/:id endpoint currently returns 404 for every user, so this
 * answers only those XHRs in-page with the given profile. All other requests stay live.
 */
export function stubUserEndpoint(user: StubUser) {
  return browser.executeScript((stub: StubUser) => {
    const proto = XMLHttpRequest.prototype as any;
    if (proto.__userStubbed) {
      return;
    }
    proto.__userStubbed = true;
    const open = proto.open;
    const send = proto.send;
    proto.open = function(method: string, url: string) {
      const match = /\/user\/([^/?#]+)/.exec(url);
      this.__stubUserId = match ? decodeURIComponent(match[1]) : null;
      return open.apply(this, arguments);
    };
    proto.send = function() {
      if (!this.__stubUserId) {
        return send.apply(this, arguments);
      }
      const body = JSON.stringify(Object.assign({}, stub, { id: this.__stubUserId }));
      Object.defineProperty(this, 'status', { value: 200 });
      Object.defineProperty(this, 'statusText', { value: 'OK' });
      Object.defineProperty(this, 'responseText', { value: body });
      this.getAllResponseHeaders = () => 'content-type: application/json';
      setTimeout(() => this.onload());
    };
  }, user);
}
