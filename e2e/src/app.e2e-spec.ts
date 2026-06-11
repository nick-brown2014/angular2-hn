import { browser, by, element, ExpectedConditions as EC } from 'protractor';
import { FeedPage } from './feed.po';
import { ItemDetailsPage } from './item-details.po';
import { UserPage } from './user.po';

describe('Angular HN App', () => {
  const feedPage = new FeedPage();
  const itemDetailsPage = new ItemDetailsPage();
  const userPage = new UserPage();

  const waitForContent = async (timeout = 15000) => {
    await browser.wait(
      EC.presenceOf(element(by.css('ol li, .profile, .item, .error-section, .loading-section'))),
      timeout
    );
  };

  describe('Navigation and Redirects', () => {
    it('should redirect / to /news/1', async () => {
      await browser.get('/');
      await browser.wait(EC.urlContains('/news/1'), 5000);
      expect(await browser.getCurrentUrl()).toContain('/news/1');
    });
  });

  describe('Feed Page', () => {
    it('should display a list of items', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('ol li'))), 15000);
      const items = feedPage.getItemsList();
      expect(await items.count()).toBeGreaterThan(0);
    });

    it('should show item titles', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('.title'))), 15000);
      const titles = feedPage.getItemTitles();
      expect(await titles.count()).toBeGreaterThan(0);
    });

    it('should have a More link for pagination', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('a.more'))), 15000);
      expect(await feedPage.getMoreLink().isPresent()).toBe(true);
    });

    it('should navigate to page 2 when clicking More', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('a.more'))), 15000);
      await feedPage.getMoreLink().click();
      await browser.wait(EC.urlContains('/news/2'), 5000);
      expect(await browser.getCurrentUrl()).toContain('/news/2');
    });
  });

  describe('Header Navigation', () => {
    it('should navigate to newest feed', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('.header-nav'))), 5000);
      await element(by.css('a[routerlink="/newest/1"]')).click();
      await browser.wait(EC.urlContains('/newest/1'), 5000);
      expect(await browser.getCurrentUrl()).toContain('/newest/1');
    });

    it('should navigate to show feed', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('.header-nav'))), 5000);
      await element(by.css('a[routerlink="/show/1"]')).click();
      await browser.wait(EC.urlContains('/show/1'), 5000);
      expect(await browser.getCurrentUrl()).toContain('/show/1');
    });

    it('should navigate to ask feed', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('.header-nav'))), 5000);
      await element(by.css('a[routerlink="/ask/1"]')).click();
      await browser.wait(EC.urlContains('/ask/1'), 5000);
      expect(await browser.getCurrentUrl()).toContain('/ask/1');
    });

    it('should navigate to jobs feed', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('.header-nav'))), 5000);
      await element(by.css('a[routerlink="/jobs/1"]')).click();
      await browser.wait(EC.urlContains('/jobs/1'), 5000);
      expect(await browser.getCurrentUrl()).toContain('/jobs/1');
    });
  });

  describe('Settings Panel', () => {
    it('should open settings when clicking the settings icon', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('.settings'))), 5000);
      await element(by.css('.settings')).click();
      await browser.wait(EC.presenceOf(element(by.css('app-settings'))), 5000);
      expect(await element(by.css('app-settings')).isPresent()).toBe(true);
    });

    it('should close settings when clicking the close button', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('.settings'))), 5000);
      await element(by.css('.settings')).click();
      await browser.wait(EC.presenceOf(element(by.css('.close'))), 5000);
      await element(by.css('.close')).click();
      expect(await element(by.css('app-settings')).isPresent()).toBe(false);
    });
  });

  describe('Item Details', () => {
    it('should navigate to item details when clicking an internal item link', async () => {
      await feedPage.navigateTo('ask', 1);
      await browser.wait(EC.presenceOf(element(by.css('ol li'))), 15000);
      const internalLink = element.all(by.css('a.title[ng-reflect-router-link]')).first();
      if (await internalLink.isPresent()) {
        await internalLink.click();
        await browser.wait(EC.urlContains('/item/'), 5000);
        expect(await browser.getCurrentUrl()).toContain('/item/');
      }
    });
  });

  describe('User Profile', () => {
    it('should navigate to user profile when clicking a username', async () => {
      await feedPage.navigateTo('news', 1);
      await browser.wait(EC.presenceOf(element(by.css('ol li'))), 15000);
      const userLink = element.all(by.css('a[href*="/user/"]')).first();
      if (await userLink.isPresent()) {
        await userLink.click();
        await browser.wait(EC.urlContains('/user/'), 5000);
        expect(await browser.getCurrentUrl()).toContain('/user/');
      }
    });
  });
});
