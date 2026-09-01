import { fakeAsync, tick } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';

// `unfetch` (imported as `fetch` by the service) is backed by XMLHttpRequest,
// so requests are intercepted by swapping the global XMLHttpRequest.
class MockXMLHttpRequest {
  static responses: { [url: string]: any } = {};
  static requestedUrls: string[] = [];
  static failNextRequest = false;

  status = 200;
  statusText = 'OK';
  response: any = null;
  responseText = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void;
  onerror: (error?: any) => void;

  private url = '';

  open(method: string, url: string): void {
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader(): void {}

  getAllResponseHeaders(): string {
    return 'content-type: application/json';
  }

  send(): void {
    MockXMLHttpRequest.requestedUrls.push(this.url);

    if (MockXMLHttpRequest.failNextRequest) {
      this.onerror(new Error('network error'));
      return;
    }

    this.responseText = JSON.stringify(MockXMLHttpRequest.responses[this.url]);
    this.response = this.responseText;
    this.onload();
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let nativeXMLHttpRequest: any;

  beforeEach(() => {
    nativeXMLHttpRequest = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = MockXMLHttpRequest;
    MockXMLHttpRequest.responses = {};
    MockXMLHttpRequest.requestedUrls = [];
    MockXMLHttpRequest.failNextRequest = false;

    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = nativeXMLHttpRequest;
  });

  it('creates with the hnapi base url', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('fetchFeed requests the paged feed and emits the parsed stories', fakeAsync(() => {
    const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }];
    MockXMLHttpRequest.responses[`${baseUrl}/news?page=2`] = stories;

    let emitted: Story[];
    service.fetchFeed('news', 2).subscribe(items => (emitted = items));
    tick();

    expect(MockXMLHttpRequest.requestedUrls).toEqual([`${baseUrl}/news?page=2`]);
    expect(emitted).toEqual(stories as any);
  }));

  it('fetchFeed emits an error when the request fails', fakeAsync(() => {
    MockXMLHttpRequest.failNextRequest = true;

    let error: any;
    service.fetchFeed('news', 1).subscribe(() => {}, err => (error = err));
    tick();

    expect(error).toBeTruthy();
  }));

  it('fetchItemContent requests the item and emits it unchanged for non-poll stories', fakeAsync(() => {
    const story = { id: 7, type: 'story', title: 'A story' };
    MockXMLHttpRequest.responses[`${baseUrl}/item/7`] = story;

    let emitted: Story;
    service.fetchItemContent(7).subscribe(item => (emitted = item));
    tick();

    expect(MockXMLHttpRequest.requestedUrls).toEqual([`${baseUrl}/item/7`]);
    expect(emitted).toEqual(story as any);
  }));

  it('fetchItemContent resolves poll options and accumulates the vote count', fakeAsync(() => {
    const poll = {
      id: 100,
      type: 'poll',
      title: 'A poll',
      poll: [{}, {}]
    };
    MockXMLHttpRequest.responses[`${baseUrl}/item/100`] = poll;
    MockXMLHttpRequest.responses[`${baseUrl}/item/101`] = { points: 3, content: 'Option A' };
    MockXMLHttpRequest.responses[`${baseUrl}/item/102`] = { points: 4, content: 'Option B' };

    let emitted: Story;
    service.fetchItemContent(100).subscribe(item => (emitted = item));
    tick();

    expect(MockXMLHttpRequest.requestedUrls).toEqual([
      `${baseUrl}/item/100`,
      `${baseUrl}/item/101`,
      `${baseUrl}/item/102`
    ]);
    expect(emitted.poll).toEqual([
      { points: 3, content: 'Option A' },
      { points: 4, content: 'Option B' }
    ] as any);
    expect(emitted.poll_votes_count).toBe(7);
  }));

  it('fetchPollContent requests a single poll option', fakeAsync(() => {
    MockXMLHttpRequest.responses[`${baseUrl}/item/55`] = { points: 9, content: 'Option' };

    let emitted: any;
    service.fetchPollContent(55).subscribe(result => (emitted = result));
    tick();

    expect(MockXMLHttpRequest.requestedUrls).toEqual([`${baseUrl}/item/55`]);
    expect(emitted).toEqual({ points: 9, content: 'Option' });
  }));

  it('fetchUser requests the user profile', fakeAsync(() => {
    const user = { id: 'pg', karma: 1000 };
    MockXMLHttpRequest.responses[`${baseUrl}/user/pg`] = user;

    let emitted: User;
    service.fetchUser('pg').subscribe(data => (emitted = data));
    tick();

    expect(MockXMLHttpRequest.requestedUrls).toEqual([`${baseUrl}/user/pg`]);
    expect(emitted).toEqual(user as any);
  }));

  it('stops emitting once the subscription is cancelled', fakeAsync(() => {
    MockXMLHttpRequest.responses[`${baseUrl}/user/pg`] = { id: 'pg' };

    const next = jasmine.createSpy('next');
    service
      .fetchUser('pg')
      .subscribe(next)
      .unsubscribe();
    tick();

    expect(next).not.toHaveBeenCalled();
  }));
});
