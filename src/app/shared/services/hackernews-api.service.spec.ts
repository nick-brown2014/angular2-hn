import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

// unfetch is an XMLHttpRequest-based ponyfill, so requests are intercepted at the XHR level.
class FakeXMLHttpRequest {
  static instances: FakeXMLHttpRequest[] = [];

  method: string;
  url: string;
  async: boolean;
  status = 0;
  statusText = '';
  responseText = '';
  response = '';
  responseURL = '';
  withCredentials = false;
  requestHeaders: { [key: string]: string } = {};
  body: string | null;
  onload: () => void;
  onerror: (err: Error) => void;

  constructor() {
    FakeXMLHttpRequest.instances.push(this);
  }

  open(method: string, url: string, async: boolean) {
    this.method = method;
    this.url = url;
    this.async = async;
  }

  setRequestHeader(name: string, value: string) {
    this.requestHeaders[name] = value;
  }

  send(body: string | null) {
    this.body = body;
  }

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  respond(status: number, body: unknown) {
    this.status = status;
    this.statusText = status === 200 ? 'OK' : 'Error';
    this.responseText = typeof body === 'string' ? body : JSON.stringify(body);
    this.response = this.responseText;
    this.responseURL = this.url;
    this.onload();
  }

  fail(err: Error) {
    this.onerror(err);
  }
}

function requestFor(url: string): FakeXMLHttpRequest {
  const request = FakeXMLHttpRequest.instances.find(xhr => xhr.url === url);
  if (!request) {
    throw new Error(`No request made to ${url}`);
  }
  return request;
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let originalXHR: typeof XMLHttpRequest;

  beforeEach(() => {
    FakeXMLHttpRequest.instances = [];
    originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = FakeXMLHttpRequest as unknown as typeof XMLHttpRequest;

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    window.XMLHttpRequest = originalXHR;
  });

  it('uses the node-hnapi base url', () => {
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('is lazy: no request is made until subscribed', () => {
    const feed$ = service.fetchFeed('news', 1);
    expect(FakeXMLHttpRequest.instances.length).toBe(0);
    feed$.subscribe();
    expect(FakeXMLHttpRequest.instances.length).toBe(1);
  });

  describe('fetchFeed', () => {
    it('requests the feed page and emits the stories then completes', fakeAsync(() => {
      const stories = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }] as Story[];
      let result: Story[];
      let completed = false;

      service.fetchFeed('newest', 3).subscribe(data => (result = data), fail, () => (completed = true));

      const request = requestFor(`${baseUrl}/newest?page=3`);
      expect(request.method).toBe('get');
      expect(request.async).toBe(true);

      request.respond(200, stories);
      flushMicrotasks();

      expect(result).toEqual(stories);
      expect(completed).toBe(true);
    }));

    it('propagates network errors', fakeAsync(() => {
      const networkError = new Error('offline');
      let error: Error;

      service.fetchFeed('news', 1).subscribe(fail, err => (error = err));
      requestFor(`${baseUrl}/news?page=1`).fail(networkError);
      flushMicrotasks();

      expect(error).toBe(networkError);
    }));

    it('propagates JSON parse errors', fakeAsync(() => {
      let error: Error;

      service.fetchFeed('news', 1).subscribe(fail, err => (error = err));
      requestFor(`${baseUrl}/news?page=1`).respond(404, '<!DOCTYPE html><p>Not Found</p>');
      flushMicrotasks();

      expect(error instanceof SyntaxError).toBe(true);
    }));

    it('does not emit after unsubscribe (cancelToken)', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      const complete = jasmine.createSpy('complete');

      const subscription = service.fetchFeed('news', 1).subscribe(next, fail, complete);
      subscription.unsubscribe();

      requestFor(`${baseUrl}/news?page=1`).respond(200, [{ id: 1 }]);
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
      expect(complete).not.toHaveBeenCalled();
    }));
  });

  describe('fetchItemContent', () => {
    it('requests the item and emits it unchanged for non-poll items', fakeAsync(() => {
      const story = { id: 42, type: 'story', title: 'Story', comments: [] } as Story;
      let result: Story;

      service.fetchItemContent(42).subscribe(data => (result = data));
      requestFor(`${baseUrl}/item/42`).respond(200, story);
      flushMicrotasks();

      expect(result).toEqual(story);
      expect(result.poll_votes_count).toBeUndefined();
      expect(FakeXMLHttpRequest.instances.length).toBe(1);
    }));

    it('fetches each poll option and aggregates poll_votes_count for polls', fakeAsync(() => {
      const poll = {
        id: 100,
        type: 'poll',
        title: 'Poll',
        poll: [{ points: 0, content: '' }, { points: 0, content: '' }],
      } as Story;
      const optionA: PollResult = { points: 7, content: 'A' };
      const optionB: PollResult = { points: 5, content: 'B' };
      let result: Story;

      service.fetchItemContent(100).subscribe(data => (result = data));
      requestFor(`${baseUrl}/item/100`).respond(200, poll);
      flushMicrotasks();

      expect(result.poll_votes_count).toBe(0);
      expect(FakeXMLHttpRequest.instances.map(xhr => xhr.url)).toEqual([
        `${baseUrl}/item/100`,
        `${baseUrl}/item/101`,
        `${baseUrl}/item/102`,
      ]);

      requestFor(`${baseUrl}/item/101`).respond(200, optionA);
      requestFor(`${baseUrl}/item/102`).respond(200, optionB);
      flushMicrotasks();

      expect(result.poll).toEqual([optionA, optionB]);
      expect(result.poll_votes_count).toBe(12);
    }));

    it('propagates errors', fakeAsync(() => {
      const networkError = new Error('boom');
      let error: Error;

      service.fetchItemContent(1).subscribe(fail, err => (error = err));
      requestFor(`${baseUrl}/item/1`).fail(networkError);
      flushMicrotasks();

      expect(error).toBe(networkError);
    }));
  });

  describe('fetchPollContent', () => {
    it('requests the poll option item and emits it', fakeAsync(() => {
      const option: PollResult = { points: 3, content: 'Yes' };
      let result: PollResult;

      service.fetchPollContent(7).subscribe(data => (result = data));
      requestFor(`${baseUrl}/item/7`).respond(200, option);
      flushMicrotasks();

      expect(result).toEqual(option);
    }));
  });

  describe('fetchUser', () => {
    it('requests the user and emits it', fakeAsync(() => {
      const user = { id: 'pg', karma: 155000, created: '19 years ago', about: 'Bio' } as User;
      let result: User;

      service.fetchUser('pg').subscribe(data => (result = data));
      requestFor(`${baseUrl}/user/pg`).respond(200, user);
      flushMicrotasks();

      expect(result).toEqual(user);
    }));

    it('propagates errors', fakeAsync(() => {
      const networkError = new Error('nope');
      let error: Error;

      service.fetchUser('pg').subscribe(fail, err => (error = err));
      requestFor(`${baseUrl}/user/pg`).fail(networkError);
      flushMicrotasks();

      expect(error).toBe(networkError);
    }));

    it('does not emit after unsubscribe (cancelToken)', fakeAsync(() => {
      const next = jasmine.createSpy('next');

      service.fetchUser('pg').subscribe(next).unsubscribe();
      requestFor(`${baseUrl}/user/pg`).respond(200, { id: 'pg' });
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
    }));
  });
});
