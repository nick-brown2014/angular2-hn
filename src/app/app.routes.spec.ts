import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgModuleFactoryLoader } from '@angular/core';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';

import { routing } from './app.routes';
import { FeedComponent } from './feeds/feed/feed.component';
import { ItemComponent } from './feeds/item/item.component';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { SettingsService } from './shared/services/settings.service';

@Component({ template: '' })
class DummyComponent {}

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
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'news/1', pathMatch: 'full' },
          { path: 'news', children: [{ path: ':page', component: FeedComponent }], data: { feedType: 'news' } },
          { path: 'newest', children: [{ path: ':page', component: FeedComponent }], data: { feedType: 'newest' } },
          { path: 'show', children: [{ path: ':page', component: FeedComponent }], data: { feedType: 'show' } },
          { path: 'ask', children: [{ path: ':page', component: FeedComponent }], data: { feedType: 'ask' } },
          { path: 'jobs', children: [{ path: ':page', component: FeedComponent }], data: { feedType: 'jobs' } },
          { path: 'item/:id', component: DummyComponent },
          { path: 'user/:id', component: DummyComponent }
        ])
      ],
      declarations: [FeedComponent, ItemComponent, DummyComponent],
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

  it('should navigate to /item/:id', fakeAsync(() => {
    router.navigate(['/item', '123']);
    tick();
    expect(location.path()).toBe('/item/123');
  }));

  it('should navigate to /user/:id', fakeAsync(() => {
    router.navigate(['/user', 'testuser']);
    tick();
    expect(location.path()).toBe('/user/testuser');
  }));
});
