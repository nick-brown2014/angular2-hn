import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

class FakeXMLHttpRequest {
  static requests: FakeXMLHttpRequest[] = [];

  method: string;
  url: string;
  responseURL = '';
  status = 0;
  statusText = '';
  responseText = '';
  withCredentials = false;
  onload: () => void;
  onerror: (error: Error) => void;

  constructor() {
    FakeXMLHttpRequest.requests.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader() {}

  send() {}

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  respond(body: unknown, status = 200) {
    this.status = status;
    this.responseText = JSON.stringify(body);
    this.onload();
  }

  fail() {
    this.onerror(new TypeError('Network request failed'));
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let realXMLHttpRequest: typeof XMLHttpRequest;

  function lastRequest(): FakeXMLHttpRequest {
    return FakeXMLHttpRequest.requests[FakeXMLHttpRequest.requests.length - 1];
  }

  beforeEach(() => {
    FakeXMLHttpRequest.requests = [];
    realXMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = FakeXMLHttpRequest as unknown as typeof XMLHttpRequest;

    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService]
    });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    window.XMLHttpRequest = realXMLHttpRequest;
  });

  it('should be created with the node-hnapi base url', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  describe('fetchFeed', () => {
    it('should not issue a request until subscribed', () => {
      service.fetchFeed('news', 1);
      expect(FakeXMLHttpRequest.requests.length).toBe(0);
    });

    it('should GET the feed endpoint for the given type and page and emit the stories', fakeAsync(() => {
      const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }] as Story[];
      let result: Story[];
      let completed = false;

      service.fetchFeed('newest', 3).subscribe(items => result = items, fail, () => completed = true);

      expect(FakeXMLHttpRequest.requests.length).toBe(1);
      expect(lastRequest().method).toBe('get');
      expect(lastRequest().url).toBe(`${baseUrl}/newest?page=3`);

      lastRequest().respond(stories);
      flushMicrotasks();

      expect(result).toEqual(stories);
      expect(completed).toBe(true);
    }));

    it('should error when the request fails', fakeAsync(() => {
      let error: Error;
      service.fetchFeed('news', 1).subscribe(fail, err => error = err);

      lastRequest().fail();
      flushMicrotasks();

      expect(error).toEqual(jasmine.any(TypeError));
    }));

    it('should not emit if unsubscribed before the response arrives', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      const subscription = service.fetchFeed('news', 1).subscribe(next);

      subscription.unsubscribe();
      lastRequest().respond([{ id: 1 }]);
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
    }));
  });

  describe('fetchItemContent', () => {
    it('should GET the item endpoint and emit a non-poll story unchanged', fakeAsync(() => {
      const story = { id: 42, type: 'story', title: 'A story', comments: [] } as Story;
      let result: Story;

      service.fetchItemContent(42).subscribe(item => result = item);

      expect(lastRequest().url).toBe(`${baseUrl}/item/42`);
      lastRequest().respond(story);
      flushMicrotasks();

      expect(result).toEqual(story);
      expect(FakeXMLHttpRequest.requests.length).toBe(1);
    }));

    it('should fetch each poll option and aggregate the vote count for polls', fakeAsync(() => {
      const poll = { id: 100, type: 'poll', title: 'A poll', poll: [{}, {}] } as Story;
      let result: Story;

      service.fetchItemContent(100).subscribe(item => result = item);
      lastRequest().respond(poll);
      flushMicrotasks();

      const [, optionOne, optionTwo] = FakeXMLHttpRequest.requests;
      expect(FakeXMLHttpRequest.requests.length).toBe(3);
      expect(optionOne.url).toBe(`${baseUrl}/item/101`);
      expect(optionTwo.url).toBe(`${baseUrl}/item/102`);
      expect(result.poll_votes_count).toBe(0);

      optionOne.respond({ points: 7, content: 'Yes' });
      optionTwo.respond({ points: 3, content: 'No' });
      flushMicrotasks();

      expect(result.poll).toEqual([{ points: 7, content: 'Yes' }, { points: 3, content: 'No' }]);
      expect(result.poll_votes_count).toBe(10);
    }));
  });

  describe('fetchPollContent', () => {
    it('should GET the item endpoint for the poll option', fakeAsync(() => {
      let result: PollResult;

      service.fetchPollContent(7).subscribe(pollResult => result = pollResult);

      expect(lastRequest().url).toBe(`${baseUrl}/item/7`);
      lastRequest().respond({ points: 5, content: 'Option' });
      flushMicrotasks();

      expect(result).toEqual({ points: 5, content: 'Option' });
    }));
  });

  describe('fetchUser', () => {
    it('should GET the user endpoint and emit the user', fakeAsync(() => {
      const user = { id: 'pg', karma: 155000, created: '13 years ago', about: 'Bio' } as User;
      let result: User;

      service.fetchUser('pg').subscribe(data => result = data);

      expect(lastRequest().url).toBe(`${baseUrl}/user/pg`);
      lastRequest().respond(user);
      flushMicrotasks();

      expect(result).toEqual(user);
    }));

    it('should error when the response is not valid JSON', fakeAsync(() => {
      let error: Error;
      service.fetchUser('nobody').subscribe(fail, err => error = err);

      const request = lastRequest();
      request.status = 404;
      request.responseText = 'Not Found';
      request.onload();
      flushMicrotasks();

      expect(error).toEqual(jasmine.any(SyntaxError));
    }));
  });
});
