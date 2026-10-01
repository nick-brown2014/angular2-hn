import { by, element, ElementArrayFinder, ElementFinder } from 'protractor';

import { AppPage, waitForElement } from './app.po';

const COMMENTS_LINK = '.subtext-laptop a[href^="/item/"]';

export class FeedPage extends AppPage {
  async load(feed = 'news', page = 1) {
    await this.navigateTo(`${feed}/${page}`);
    await this.waitForStories();
  }

  waitForStories() {
    return waitForElement(this.getStories().first(), 'feed stories did not load');
  }

  getStories(): ElementArrayFinder {
    return element.all(by.css('app-feed li.post'));
  }

  getStoryTitles(): ElementArrayFinder {
    return element.all(by.css('app-feed li.post a.title'));
  }

  /** First story that has a comments link (job posts don't). */
  getFirstDiscussableStory(): ElementFinder {
    return this.getStories()
      .filter(story => story.element(by.css(COMMENTS_LINK)).isPresent())
      .first();
  }

  getCommentsLink(story: ElementFinder): ElementFinder {
    return story.element(by.css(COMMENTS_LINK));
  }

  getTitleLink(story: ElementFinder): ElementFinder {
    return story.element(by.css('a.title'));
  }

  getFirstExternalTitleLink(): ElementFinder {
    return element.all(by.css('app-feed li.post a.title[href^="http"]')).first();
  }

  getFirstAuthorLink(): ElementFinder {
    return element.all(by.css('app-feed li.post .subtext-laptop a[href^="/user/"]')).first();
  }

  getMoreLink(): ElementFinder {
    return element(by.css('app-feed .nav a.more'));
  }

  getErrorMessage(): ElementFinder {
    return element(by.css('app-feed app-error-message'));
  }
}
