import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, Routes } from '@angular/router';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { routing } from './app.routes';
import { FeedComponent } from './feeds/feed/feed.component';
import { ItemComponent } from './feeds/item/item.component';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { SettingsService } from './shared/services/settings.service';

describe('App Routes', () => {
  let router: Router;
  let location: Location;
  let mockHnService: any;
  let mockSettingsService: any;

  beforeEach(() => {
    mockHnService = {
      fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue({ subscribe: () => {} }),
      fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue({ subscribe: () => {} }),
      fetchUser: jasmine.createSpy('fetchUser').and.returnValue({ subscribe: () => {} })
    };

    mockSettingsService = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    TestBed.configureTestingModule({
      imports: [
        routing,
        RouterTestingModule
      ],
      declarations: [FeedComponent, ItemComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHnService },
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    router.initialNavigation();
  });

  it('should redirect empty path to /news/1', fakeAsync(() => {
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/news/1');
  }));

  it('should navigate to /news/:page with FeedComponent', fakeAsync(() => {
    router.navigate(['/news', '2']);
    tick();
    expect(location.path()).toBe('/news/2');
  }));

  it('should navigate to /newest/:page', fakeAsync(() => {
    router.navigate(['/newest', '1']);
    tick();
    expect(location.path()).toBe('/newest/1');
  }));

  it('should navigate to /show/:page', fakeAsync(() => {
    router.navigate(['/show', '1']);
    tick();
    expect(location.path()).toBe('/show/1');
  }));

  it('should navigate to /ask/:page', fakeAsync(() => {
    router.navigate(['/ask', '1']);
    tick();
    expect(location.path()).toBe('/ask/1');
  }));

  it('should navigate to /jobs/:page', fakeAsync(() => {
    router.navigate(['/jobs', '1']);
    tick();
    expect(location.path()).toBe('/jobs/1');
  }));

  describe('route data', () => {
    it('should provide feedType "news" for /news routes', () => {
      const newsRoute = router.config.find(r => r.path === 'news');
      expect(newsRoute).toBeDefined();
      expect(newsRoute.data).toEqual({ feedType: 'news' });
    });

    it('should provide feedType "newest" for /newest routes', () => {
      const route = router.config.find(r => r.path === 'newest');
      expect(route).toBeDefined();
      expect(route.data).toEqual({ feedType: 'newest' });
    });

    it('should provide feedType "show" for /show routes', () => {
      const route = router.config.find(r => r.path === 'show');
      expect(route).toBeDefined();
      expect(route.data).toEqual({ feedType: 'show' });
    });

    it('should provide feedType "ask" for /ask routes', () => {
      const route = router.config.find(r => r.path === 'ask');
      expect(route).toBeDefined();
      expect(route.data).toEqual({ feedType: 'ask' });
    });

    it('should provide feedType "jobs" for /jobs routes', () => {
      const route = router.config.find(r => r.path === 'jobs');
      expect(route).toBeDefined();
      expect(route.data).toEqual({ feedType: 'jobs' });
    });
  });

  describe('lazy-loaded routes', () => {
    it('should have loadChildren for /item path', () => {
      const itemRoute = router.config.find(r => r.path === 'item');
      expect(itemRoute).toBeDefined();
      expect(itemRoute.loadChildren).toBeDefined();
    });

    it('should have loadChildren for /user path', () => {
      const userRoute = router.config.find(r => r.path === 'user');
      expect(userRoute).toBeDefined();
      expect(userRoute.loadChildren).toBeDefined();
    });
  });
});
