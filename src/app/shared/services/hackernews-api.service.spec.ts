import { fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';

// `unfetch` (the fetch polyfill this service imports) is backed by
// XMLHttpRequest, so the network seam we stub is XMLHttpRequest rather than a
// global `fetch`.
let mockInstances: MockXhr[] = [];
let mockResponder: (url: string) => any = () => ({});

class MockXhr {
  method = '';
  url = '';
  status = 200;
  responseText = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void = () => {};
  onerror: () => void = () => {};

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
    mockInstances.push(this);
  }

  setRequestHeader(): void {}

  getAllResponseHeaders(): string {
    return '';
  }

  send(): void {
    Promise.resolve().then(() => {
      const data = mockResponder(this.url);
      this.responseURL = this.url;
      this.responseText = JSON.stringify(data);
      this.onload();
    });
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let originalXhr: typeof XMLHttpRequest;

  beforeEach(() => {
    originalXhr = window.XMLHttpRequest;
    (window as any).XMLHttpRequest = MockXhr;
    mockInstances = [];
    mockResponder = () => ({});
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXhr;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('fetchFeed requests the correct URL and emits the response', fakeAsync(() => {
    const feed = [{ id: 1 }, { id: 2 }];
    mockResponder = () => feed;

    let result: any;
    service.fetchFeed('news', 2).subscribe(r => (result = r));

    expect(mockInstances[0].url).toBe(`${baseUrl}/news?page=2`);
    flushMicrotasks();
    expect(result).toEqual(feed as any);
  }));

  it('fetchPollContent requests the correct item URL', fakeAsync(() => {
    mockResponder = () => ({ points: 42 });

    let result: any;
    service.fetchPollContent(555).subscribe(r => (result = r));

    expect(mockInstances[0].url).toBe(`${baseUrl}/item/555`);
    flushMicrotasks();
    expect(result).toEqual({ points: 42 } as any);
  }));

  it('fetchUser requests the correct user URL', fakeAsync(() => {
    mockResponder = () => ({ id: 'pg', karma: 99 });

    let result: any;
    service.fetchUser('pg').subscribe(r => (result = r));

    expect(mockInstances[0].url).toBe(`${baseUrl}/user/pg`);
    flushMicrotasks();
    expect(result).toEqual({ id: 'pg', karma: 99 } as any);
  }));

  it('fetchItemContent requests the correct item URL for a normal story', fakeAsync(() => {
    const story = { id: 10, type: 'story', title: 'hi' };
    mockResponder = () => story;

    let result: any;
    service.fetchItemContent(10).subscribe(r => (result = r));

    expect(mockInstances[0].url).toBe(`${baseUrl}/item/10`);
    flushMicrotasks();
    expect(result).toEqual(story as any);
    expect(result.poll_votes_count).toBeUndefined();
  }));

  it('fetchItemContent aggregates poll option votes into poll_votes_count', fakeAsync(() => {
    mockResponder = (url: string) => {
      if (url === `${baseUrl}/item/100`) {
        return { id: 100, type: 'poll', poll: [{}, {}] };
      }
      if (url === `${baseUrl}/item/101`) {
        return { points: 10 };
      }
      if (url === `${baseUrl}/item/102`) {
        return { points: 5 };
      }
      return {};
    };

    let story: any;
    service.fetchItemContent(100).subscribe(s => (story = s));

    flushMicrotasks();

    expect(story.type).toBe('poll');
    expect(story.poll_votes_count).toBe(15);
    expect(story.poll[0]).toEqual({ points: 10 });
    expect(story.poll[1]).toEqual({ points: 5 });
  }));
});
