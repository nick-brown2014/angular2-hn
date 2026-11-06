import { NO_ERRORS_SCHEMA } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, Route, Router, ROUTES, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER } from 'rxjs';

import { routing } from './app.routes';
import { FeedComponent } from './feeds/feed/feed.component';
import { ItemDetailsModule } from './item-details/item-details.module';
import { UserModule } from './user/user.module';
import { HackerNewsAPIService } from './shared/services/hackernews-api.service';
import { createHackerNewsApiSpy } from '../testing/mocks';

// app.routes.ts only exports `RouterModule.forRoot(routes)`, so read the route config back out of its providers.
function appRoutes(): Routes {
  const flatten = (providers: any[]): any[] =>
    providers.reduce((all, p) => all.concat(Array.isArray(p) ? flatten(p) : [p]), []);
  const provider = flatten(routing.providers).find(p => p && p.provide === ROUTES);
  return provider.useValue;
}

describe('app routes', () => {
  const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];
  let routes: Routes;

  beforeAll(() => (routes = appRoutes()));

  function routeFor(path: string): Route {
    return routes.find(r => r.path === path);
  }

  it('redirects the empty path to the first page of top stories', () => {
    expect(routeFor('')).toEqual({ path: '', redirectTo: 'news/1', pathMatch: 'full' });
  });

  for (const feedType of feedTypes) {
    it(`maps /${feedType}/:page to FeedComponent with feedType "${feedType}"`, () => {
      const route = routeFor(feedType);

      expect(route.data).toEqual({ feedType });
      expect(route.children).toEqual([{ path: ':page', component: FeedComponent }]);
    });
  }

  it('lazy-loads the item details and user modules', async () => {
    expect(await (routeFor('item').loadChildren as () => Promise<any>)()).toBe(ItemDetailsModule);
    expect(await (routeFor('user').loadChildren as () => Promise<any>)()).toBe(UserModule);
  });

  describe('navigation', () => {
    let router: Router;
    let location: Location;

    beforeEach(() => {
      const api = createHackerNewsApiSpy();
      api.fetchFeed.and.returnValue(NEVER);
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes(routes)],
        declarations: [FeedComponent],
        providers: [{ provide: HackerNewsAPIService, useValue: api }],
        schemas: [NO_ERRORS_SCHEMA],
      });
      router = TestBed.inject(Router);
      location = TestBed.inject(Location);
    });

    function leafRoute(): ActivatedRoute {
      let route = router.routerState.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      return route;
    }

    it('lands on /news/1 from the root URL', fakeAsync(() => {
      router.navigateByUrl('/');
      tick();

      expect(location.path()).toBe('/news/1');
      expect(leafRoute().component).toBe(FeedComponent);
    }));

    it('passes the page param and inherits the feed type from the parent route', fakeAsync(() => {
      router.navigateByUrl('/jobs/3');
      tick();

      const leaf = leafRoute();
      expect(leaf.snapshot.params).toEqual({ page: '3' });
      expect(leaf.snapshot.data).toEqual({ feedType: 'jobs' });
    }));

    it('rejects unknown URLs', fakeAsync(() => {
      let error: any;
      router.navigateByUrl('/nope').catch(e => (error = e));
      tick();

      expect(error.message).toContain('Cannot match any routes');
    }));
  });
});
