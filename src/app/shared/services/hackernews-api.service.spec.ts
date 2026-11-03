import { fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { makeStory } from '../../../testing/mocks';

// unfetch is backed by XMLHttpRequest (not window.fetch), so the fake replaces XHR.
let requests: FakeXHR[] = [];

class FakeXHR {
  method: string;
  url: string;
  status = 0;
  statusText = '';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  sent = false;
  onload: () => void;
  onerror: (err: any) => void;

  constructor() {
    requests.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader() {}

  send() {
    this.sent = true;
  }

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  respond(body: any, status = 200) {
    this.status = status;
    this.responseURL = this.url;
    this.responseText = typeof body === 'string' ? body : JSON.stringify(body);
    this.onload();
  }

  fail() {
    this.onerror(new TypeError('Network request failed'));
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let originalXHR: typeof XMLHttpRequest;

  beforeEach(() => {
    requests = [];
    originalXHR = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXHR;
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('points at the node-hnapi base URL', () => {
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('does not send a request until subscribed', () => {
    const feed$ = service.fetchFeed('news', 1);
    expect(requests.length).toBe(0);
    feed$.subscribe();
    expect(requests.length).toBe(1);
    expect(requests[0].sent).toBe(true);
  });

  it('fetchFeed requests the feed type and page and emits the parsed stories', fakeAsync(() => {
    const stories = [makeStory({ id: 1 }), makeStory({ id: 2 })];
    let result: any;
    let completed = false;

    service.fetchFeed('newest', 2).subscribe(data => (result = data), fail, () => (completed = true));

    expect(requests[0].method).toBe('get');
    expect(requests[0].url).toBe(`${baseUrl}/newest?page=2`);

    requests[0].respond(stories);
    flushMicrotasks();

    expect(result).toEqual(JSON.parse(JSON.stringify(stories)));
    expect(completed).toBe(true);
  }));

  it('fetchItemContent requests /item/:id and emits the story unchanged for non-polls', fakeAsync(() => {
    let result: any;
    service.fetchItemContent(8863).subscribe(data => (result = data));

    expect(requests[0].url).toBe(`${baseUrl}/item/8863`);
    requests[0].respond({ id: 8863, type: 'link', title: 'My YC app' });
    flushMicrotasks();

    expect(result).toEqual({ id: 8863, type: 'link', title: 'My YC app' });
    expect(requests.length).toBe(1);
  }));

  it('fetchItemContent fetches each poll option and totals the votes', fakeAsync(() => {
    let result: any;
    service.fetchItemContent(100).subscribe(data => (result = data));

    requests[0].respond({ id: 100, type: 'poll', title: 'Poll', poll: [{}, {}] });
    flushMicrotasks();

    expect(requests.map(r => r.url)).toEqual([
      `${baseUrl}/item/100`,
      `${baseUrl}/item/101`,
      `${baseUrl}/item/102`,
    ]);
    expect(result.poll_votes_count).toBe(0);

    requests[1].respond({ points: 3, content: 'Yes' });
    requests[2].respond({ points: 7, content: 'No' });
    flushMicrotasks();

    expect(result.poll).toEqual([{ points: 3, content: 'Yes' }, { points: 7, content: 'No' }]);
    expect(result.poll_votes_count).toBe(10);
  }));

  it('fetchPollContent requests /item/:id', fakeAsync(() => {
    let result: any;
    service.fetchPollContent(42).subscribe(data => (result = data));

    expect(requests[0].url).toBe(`${baseUrl}/item/42`);
    requests[0].respond({ points: 5, content: 'Option' });
    flushMicrotasks();

    expect(result).toEqual({ points: 5, content: 'Option' });
  }));

  it('fetchUser requests /user/:id and emits the user', fakeAsync(() => {
    let result: any;
    service.fetchUser('pg').subscribe(data => (result = data));

    expect(requests[0].url).toBe(`${baseUrl}/user/pg`);
    requests[0].respond({ id: 'pg', karma: 1 });
    flushMicrotasks();

    expect(result).toEqual({ id: 'pg', karma: 1 });
  }));

  it('errors when the network request fails', fakeAsync(() => {
    let error: any;
    service.fetchFeed('news', 1).subscribe(fail, err => (error = err));

    requests[0].fail();
    flushMicrotasks();

    expect(error).toEqual(jasmine.any(TypeError));
  }));

  it('errors when the response is not JSON', fakeAsync(() => {
    let error: any;
    service.fetchUser('pg').subscribe(fail, err => (error = err));

    requests[0].respond('<pre>Cannot GET /user/pg</pre>', 404);
    flushMicrotasks();

    expect(error).toEqual(jasmine.any(SyntaxError));
  }));

  it('does not emit after unsubscribe', fakeAsync(() => {
    const next = jasmine.createSpy('next');
    const sub = service.fetchFeed('news', 1).subscribe(next);

    sub.unsubscribe();
    requests[0].respond([makeStory()]);
    flushMicrotasks();

    expect(next).not.toHaveBeenCalled();
  }));
});
