import { fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';

// unfetch is built on XMLHttpRequest rather than window.fetch, so requests are intercepted here.
class FakeXMLHttpRequest {
  static requests: FakeXMLHttpRequest[] = [];

  method: string;
  url: string;
  status = 0;
  statusText = '';
  responseURL = '';
  withCredentials = false;
  bodyReads = 0;
  onload: () => void;
  onerror: (error: any) => void;
  private body = '';

  get responseText(): string {
    this.bodyReads++;
    return this.body;
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    FakeXMLHttpRequest.requests.push(this);
  }

  setRequestHeader() {}

  getAllResponseHeaders(): string {
    return 'content-type: application/json';
  }

  send() {}

  respond(data: any, status = 200) {
    this.status = status;
    this.statusText = 'OK';
    this.responseURL = this.url;
    this.body = JSON.stringify(data);
    this.onload();
  }

  fail(error: any) {
    this.onerror(error);
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let originalXMLHttpRequest: typeof XMLHttpRequest;

  function lastRequest(): FakeXMLHttpRequest {
    return FakeXMLHttpRequest.requests[FakeXMLHttpRequest.requests.length - 1];
  }

  function requestTo(url: string): FakeXMLHttpRequest {
    return FakeXMLHttpRequest.requests.find(request => request.url === url);
  }

  beforeEach(() => {
    FakeXMLHttpRequest.requests = [];
    originalXMLHttpRequest = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXMLHttpRequest;
  });

  it('targets the node-hnapi base URL', () => {
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('does not issue a request until subscribed', () => {
    service.fetchFeed('news', 1);

    expect(FakeXMLHttpRequest.requests.length).toBe(0);
  });

  it('fetchFeed requests /{feedType}?page={page} and emits the stories', fakeAsync(() => {
    const stories = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }];
    const next = jasmine.createSpy('next');
    const complete = jasmine.createSpy('complete');

    service.fetchFeed('show', 3).subscribe(next, fail, complete);
    expect(lastRequest().method).toBe('get');
    expect(lastRequest().url).toBe(`${baseUrl}/show?page=3`);

    lastRequest().respond(stories);
    flushMicrotasks();

    expect(next).toHaveBeenCalledWith(stories);
    expect(complete).toHaveBeenCalled();
  }));

  it('fetchItemContent requests /item/{id} and emits the story', fakeAsync(() => {
    const story = { id: 42, type: 'link', title: 'Answer', comments: [] };
    let result: Story;

    service.fetchItemContent(42).subscribe(item => (result = item));
    expect(lastRequest().url).toBe(`${baseUrl}/item/42`);

    lastRequest().respond(story);
    flushMicrotasks();

    expect(result).toEqual(story as any);
    expect(FakeXMLHttpRequest.requests.length).toBe(1);
  }));

  it('fetchItemContent loads poll options and aggregates poll_votes_count', fakeAsync(() => {
    const poll = { id: 100, type: 'poll', title: 'Poll', poll: [{}, {}] };
    let result: Story;

    service.fetchItemContent(100).subscribe(item => (result = item));
    lastRequest().respond(poll);
    flushMicrotasks();

    expect(result.poll_votes_count).toBe(0);
    expect(requestTo(`${baseUrl}/item/101`)).toBeDefined();
    expect(requestTo(`${baseUrl}/item/102`)).toBeDefined();

    requestTo(`${baseUrl}/item/101`).respond({ points: 3, content: 'Yes' });
    requestTo(`${baseUrl}/item/102`).respond({ points: 4, content: 'No' });
    flushMicrotasks();

    expect(result.poll_votes_count).toBe(7);
    expect(result.poll).toEqual([{ points: 3, content: 'Yes' }, { points: 4, content: 'No' }]);
  }));

  it('fetchPollContent requests /item/{id}', fakeAsync(() => {
    const next = jasmine.createSpy('next');

    service.fetchPollContent(7).subscribe(next);
    expect(lastRequest().url).toBe(`${baseUrl}/item/7`);

    lastRequest().respond({ points: 1, content: 'Option' });
    flushMicrotasks();

    expect(next).toHaveBeenCalledWith({ points: 1, content: 'Option' });
  }));

  it('fetchUser requests /user/{id} and emits the user', fakeAsync(() => {
    const user = { id: 'pg', karma: 155000, created: '13 years ago' };
    let result: User;

    service.fetchUser('pg').subscribe(data => (result = data));
    expect(lastRequest().url).toBe(`${baseUrl}/user/pg`);

    lastRequest().respond(user);
    flushMicrotasks();

    expect(result).toEqual(user as any);
  }));

  it('emits an error when the request fails', fakeAsync(() => {
    const next = jasmine.createSpy('next');
    const error = jasmine.createSpy('error');

    service.fetchFeed('news', 1).subscribe(next, error);
    lastRequest().fail(new Error('offline'));
    flushMicrotasks();

    expect(next).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  }));

  it('does not read or emit the response after unsubscribing', fakeAsync(() => {
    const next = jasmine.createSpy('next');
    const error = jasmine.createSpy('error');
    const complete = jasmine.createSpy('complete');

    const subscription = service.fetchFeed('news', 1).subscribe(next, error, complete);
    const request = lastRequest();
    subscription.unsubscribe();

    request.respond([{ id: 1 }]);
    flushMicrotasks();

    expect(request.bodyReads).toBe(0);
    expect(next).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
  }));
});
