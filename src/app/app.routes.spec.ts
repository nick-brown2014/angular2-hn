import { Route } from '@angular/router';

import { routes } from './app.routes';

describe('App routes', () => {
  function findRoute(path: string): Route {
    const route = routes.find(r => r.path === path);
    if (!route) {
      throw new Error(`Could not find route for path "${path}"`);
    }
    return route;
  }

  it('empty path should redirect to news/1', () => {
    const root = findRoute('');
    expect(root.redirectTo).toBe('news/1');
    expect(root.pathMatch).toBe('full');
  });

  it('news route should have data {feedType: "news"}', () => {
    expect(findRoute('news').data).toEqual({ feedType: 'news' });
  });

  it('newest route should have data {feedType: "newest"}', () => {
    expect(findRoute('newest').data).toEqual({ feedType: 'newest' });
  });

  it('show route should have data {feedType: "show"}', () => {
    expect(findRoute('show').data).toEqual({ feedType: 'show' });
  });

  it('ask route should have data {feedType: "ask"}', () => {
    expect(findRoute('ask').data).toEqual({ feedType: 'ask' });
  });

  it('jobs route should have data {feedType: "jobs"}', () => {
    expect(findRoute('jobs').data).toEqual({ feedType: 'jobs' });
  });

  it('feed routes should each have a child route accepting a :page param', () => {
    const feedPaths = ['news', 'newest', 'show', 'ask', 'jobs'];
    for (const path of feedPaths) {
      const route = findRoute(path);
      expect(route.children).toBeTruthy();
      expect(route.children.length).toBe(1);
      expect(route.children[0].path).toBe(':page');
    }
  });

  it('item path should lazy-load the ItemDetailsModule', (done) => {
    const itemRoute = findRoute('item');
    expect(typeof itemRoute.loadChildren).toBe('function');
    const result = (itemRoute.loadChildren as any)();
    Promise.resolve(result).then((mod: any) => {
      expect(mod.name).toBe('ItemDetailsModule');
      done();
    });
  });

  it('user path should lazy-load the UserModule', (done) => {
    const userRoute = findRoute('user');
    expect(typeof userRoute.loadChildren).toBe('function');
    const result = (userRoute.loadChildren as any)();
    Promise.resolve(result).then((mod: any) => {
      expect(mod.name).toBe('UserModule');
      done();
    });
  });
});
