import { fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

/**
 * `unfetch` (imported by the service) is backed by `XMLHttpRequest`, so we stub
 * the global `XMLHttpRequest` to intercept requests instead of mocking `fetch`.
 * The fake XHR's behaviour is driven by these module-level fixtures.
 */
let xhrRequests: FakeXHR[] = [];
let xhrResponder: (url: string) => any = () => ({});
let xhrErrorMode = false;

class FakeXHR {
  method: string;
  url: string;
  responseURL: string;
  status = 200;
  statusText = 'OK';
  responseText = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err?: any) => void;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return '';
  }

  send() {
    xhrRequests.push(this);
    Promise.resolve().then(() => {
      if (xhrErrorMode) {
        if (this.onerror) { this.onerror(new Error('network error')); }
        return;
      }
      this.status = 200;
      this.responseText = JSON.stringify(xhrResponder(this.url));
      if (this.onload) { this.onload(); }
    });
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXHR: any;
  const baseUrl = 'https://node-hnapi.herokuapp.com';

  beforeEach(() => {
    originalXHR = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXHR as any;
    xhrRequests = [];
    xhrErrorMode = false;
    xhrResponder = () => ({});
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('should be created with the expected base url', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('fetchFeed should request the correct feed URL and emit the data', fakeAsync(() => {
    const feed = [{ id: 1 }, { id: 2 }];
    xhrResponder = () => feed;

    let result: Story[];
    service.fetchFeed('news', 2).subscribe(items => (result = items));
    flushMicrotasks();

    expect(xhrRequests[0].url).toBe(`${baseUrl}/news?page=2`);
    expect(result).toEqual(feed as any);
  }));

  it('fetchUser should request the correct user URL and emit the user', fakeAsync(() => {
    const user = { id: 'pg', karma: 100 };
    xhrResponder = () => user;

    let result: any;
    service.fetchUser('pg').subscribe(u => (result = u));
    flushMicrotasks();

    expect(xhrRequests[0].url).toBe(`${baseUrl}/user/pg`);
    expect(result).toEqual(user);
  }));

  it('fetchPollContent should request the item URL and emit the poll result', fakeAsync(() => {
    const poll = { points: 42, content: 'option A' };
    xhrResponder = () => poll;

    let result: any;
    service.fetchPollContent(555).subscribe(p => (result = p));
    flushMicrotasks();

    expect(xhrRequests[0].url).toBe(`${baseUrl}/item/555`);
    expect(result).toEqual(poll);
  }));

  it('fetchItemContent should request the correct item URL and emit a story', fakeAsync(() => {
    const story = { id: 10, type: 'story', title: 'hi', url: 'http://a.com' };
    xhrResponder = () => story;

    let result: Story;
    service.fetchItemContent(10).subscribe(s => (result = s));
    flushMicrotasks();

    expect(xhrRequests[0].url).toBe(`${baseUrl}/item/10`);
    expect(result.id).toBe(10);
  }));

  it('fetchItemContent should fan out fetchPollContent calls and accumulate poll_votes_count for polls', fakeAsync(() => {
    const mainId = 100;
    const story: any = { id: mainId, type: 'poll', poll: [{}, {}] };
    const pollResults: { [url: string]: any } = {
      [`${baseUrl}/item/${mainId}`]: story,
      [`${baseUrl}/item/${mainId + 1}`]: { points: 5, content: 'A' },
      [`${baseUrl}/item/${mainId + 2}`]: { points: 3, content: 'B' }
    };
    xhrResponder = url => pollResults[url];

    let result: Story;
    service.fetchItemContent(mainId).subscribe(s => (result = s));
    flushMicrotasks();

    expect(result.poll_votes_count).toBe(8);
    expect(result.poll[0]).toEqual({ points: 5, content: 'A' } as any);
    expect(result.poll[1]).toEqual({ points: 3, content: 'B' } as any);
    const urls = xhrRequests.map(r => r.url);
    expect(urls).toContain(`${baseUrl}/item/${mainId + 1}`);
    expect(urls).toContain(`${baseUrl}/item/${mainId + 2}`);
  }));

  it('should propagate errors to the observer', fakeAsync(() => {
    xhrErrorMode = true;

    let errored = false;
    service.fetchFeed('news', 1).subscribe(
      () => {},
      () => (errored = true)
    );
    flushMicrotasks();

    expect(errored).toBe(true);
  }));

  it('lazyFetch should set the cancel token on unsubscribe and never emit', fakeAsync(() => {
    xhrResponder = () => [{ id: 1 }];

    const next = jasmine.createSpy('next');
    const sub = service.fetchFeed('news', 1).subscribe(next);
    // Unsubscribe before the pending request resolves (runs the teardown/cancel token).
    sub.unsubscribe();
    flushMicrotasks();

    expect(next).not.toHaveBeenCalled();
  }));
});
