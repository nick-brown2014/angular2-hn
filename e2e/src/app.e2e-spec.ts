import { browser, logging } from 'protractor';

import { AppPage } from './app.po';
import { FeedPage } from './feed.po';
import { ItemDetailsPage } from './item-details.po';
import { SettingsPanel } from './settings.po';
import { UserPage } from './user.po';

describe('angular2-hn', () => {
  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

  describe('app shell', () => {
    let page: AppPage;

    beforeEach(() => {
      page = new AppPage();
    });

    it('redirects the root url to the first page of top stories', async () => {
      await page.navigateTo();
      expect(await page.getCurrentUrl()).toMatch(/\/news\/1$/);
      expect(await page.getDocumentTitle()).toBe('Angular 2 HN');
    });

    it('renders the header navigation and footer', async () => {
      await page.navigateTo('news/1');
      expect(await page.getHeaderNavLinks().getText()).toEqual(['new', 'show', 'ask', 'jobs']);
      expect(await page.getFooter().getText()).toContain('GitHub');
    });
  });

  describe('feed', () => {
    let feed: FeedPage;

    beforeEach(() => {
      feed = new FeedPage();
    });

    it('loads a page of stories', async () => {
      await feed.load('news', 1);

      expect(await feed.getStories().count()).toBe(30);
      const titles = (await feed.getStoryTitles().getText()) as unknown as string[];
      expect(titles.every(title => title.trim().length > 0)).toBe(true);
      expect(await feed.getErrorMessage().isPresent()).toBe(false);
    });

    it('paginates with the "More" link', async () => {
      await feed.load('news', 1);
      await feed.getMoreLink().click();
      await feed.waitForStories();

      expect(await feed.getCurrentUrl()).toMatch(/\/news\/2$/);
      expect(await feed.getStories().count()).toBeGreaterThan(0);
    });

    it('switches feeds from the header', async () => {
      await feed.load('news', 1);
      await feed.getHeaderNavLinks().get(0).click();
      await feed.waitForStories();

      expect(await feed.getCurrentUrl()).toMatch(/\/newest\/1$/);
    });
  });

  describe('item details', () => {
    let feed: FeedPage;
    let item: ItemDetailsPage;

    beforeEach(() => {
      feed = new FeedPage();
      item = new ItemDetailsPage();
    });

    it('navigates from a story in the feed to its item page', async () => {
      await feed.load('news', 1);
      const story = feed.getFirstDiscussableStory();
      const storyTitle = await feed.getTitleLink(story).getText();

      await feed.getCommentsLink(story).click();
      await item.waitForItem();

      expect(await item.getCurrentUrl()).toMatch(/\/item\/\d+$/);
      expect(await item.getTitle().getText()).toBe(storyTitle);
    });

    it('shows the comment thread for an item', async () => {
      await item.load(1);

      expect(await item.getTitle().getText()).toBe('Y Combinator');
      expect(await item.getTopLevelComments().count()).toBeGreaterThan(0);
      expect(await item.getComments().first().getText()).toContain('sama');
    });
  });

  describe('user profile', () => {
    let feed: FeedPage;
    let user: UserPage;

    beforeEach(() => {
      feed = new FeedPage();
      user = new UserPage();
    });

    it('renders the profile when navigating from a story author link', async () => {
      await feed.load('news', 1);
      const author = feed.getFirstAuthorLink();
      const authorName = await author.getText();
      await user.stubUserApi({ id: authorName, created: '10 years ago', karma: 4242, about: '<p>Hello from e2e</p>' });

      await author.click();
      await user.waitForProfile();

      expect(await user.getCurrentUrl()).toMatch(new RegExp(`/user/${authorName}$`));
      expect(await user.getName().getText()).toBe(authorName);
      expect(await user.getKarma().getText()).toContain('4242');
      expect(await user.getCreated().getText()).toBe('Created 10 years ago');
      expect(await user.getAbout().getText()).toBe('Hello from e2e');
    });
  });

  describe('settings panel', () => {
    let feed: FeedPage;
    let settings: SettingsPanel;

    beforeEach(async () => {
      feed = new FeedPage();
      settings = new SettingsPanel();
      await feed.load('news', 1);
    });

    afterEach(async () => {
      await settings.clearLocalStorage();
    });

    it('opens and closes from the header cog', async () => {
      expect(await settings.getPanel().isPresent()).toBe(false);

      await settings.open();
      expect(await settings.getPanel().isDisplayed()).toBe(true);

      await settings.close();
      expect(await settings.getPanel().isPresent()).toBe(false);
    });

    it('applies the selected theme', async () => {
      await settings.open();
      await settings.getThemeRadio('night').click();
      expect(await settings.getThemeWrapper().getAttribute('class')).toContain('night');

      await settings.getThemeRadio('amoledblack').click();
      expect(await settings.getThemeWrapper().getAttribute('class')).toContain('amoledblack');
    });

    it('toggles opening links in a new tab', async () => {
      await settings.open();
      const checkbox = settings.getOpenInNewTabCheckbox();
      const initial = await checkbox.isSelected();

      await checkbox.click();
      expect(await checkbox.isSelected()).toBe(!initial);

      await settings.close();
      const target = await feed.getFirstExternalTitleLink().getAttribute('target');
      expect(target === '_blank').toBe(!initial);
    });
  });
});
