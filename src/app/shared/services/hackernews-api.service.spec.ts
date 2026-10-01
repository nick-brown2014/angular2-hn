import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { mockPollResult, mockStories, mockStory, mockUser } from '../../testing/mock-data';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

// The service fetches via `unfetch`, which is backed by XMLHttpRequest rather than
// Angular's HttpClient, so requests are intercepted with a fake XHR implementation.
class FakeXHR {
  static requests: FakeXHR[] = [];

  method: string;
  url: string;
  status = 0;
  statusText = '';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err: Error) => void;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader() {}

  send() {
    FakeXHR.requests.push(this);
  }

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  respond(body: unknown, status = 200) {
    this.status = status;
    this.statusText = 'OK';
    this.responseURL = this.url;
    this.responseText = JSON.stringify(body);
    this.onload();
  }

  fail() {
    this.onerror(new TypeError('Network request failed'));
  }
}

describe('HackerNewsAPIService', () => {
  const globalScope = window as unknown as { XMLHttpRequest: unknown };
  let originalXHR: unknown;
  let service: HackerNewsAPIService;

  const lastRequest = () => FakeXHR.requests[FakeXHR.requests.length - 1];

  beforeEach(() => {
    FakeXHR.requests = [];
    originalXHR = globalScope.XMLHttpRequest;
    globalScope.XMLHttpRequest = FakeXHR;

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    globalScope.XMLHttpRequest = originalXHR;
  });

  it('points at the node-hnapi base URL', () => {
    expect(service.baseUrl).toBe(BASE_URL);
  });

  describe('fetchFeed', () => {
    ['news', 'newest', 'show', 'ask', 'jobs'].forEach(feedType => {
      it(`requests the ${feedType} feed for the given page`, () => {
        service.fetchFeed(feedType, 3).subscribe();

        expect(FakeXHR.requests.length).toBe(1);
        expect(lastRequest().method).toBe('get');
        expect(lastRequest().url).toBe(`${BASE_URL}/${feedType}?page=3`);
      });
    });

    it('emits the parsed stories and completes', fakeAsync(() => {
      const stories = mockStories(3);
      let result: Story[];
      let completed = false;

      service.fetchFeed('news', 1).subscribe(data => (result = data), fail, () => (completed = true));
      lastRequest().respond(stories);
      flushMicrotasks();

      expect(result).toEqual(stories);
      expect(completed).toBe(true);
    }));

    it('does not issue a request until subscribed', () => {
      const feed$ = service.fetchFeed('news', 1);
      expect(FakeXHR.requests.length).toBe(0);

      feed$.subscribe();
      expect(FakeXHR.requests.length).toBe(1);
    });

    it('propagates network errors to the subscriber', fakeAsync(() => {
      let error: Error;

      service.fetchFeed('news', 1).subscribe(fail, err => (error = err));
      lastRequest().fail();
      flushMicrotasks();

      expect(error).toEqual(jasmine.any(TypeError));
    }));

    it('does not emit if unsubscribed before the response arrives', fakeAsync(() => {
      const next = jasmine.createSpy('next');

      const sub = service.fetchFeed('news', 1).subscribe(next);
      sub.unsubscribe();
      lastRequest().respond(mockStories(2));
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
    }));
  });

  describe('fetchItemContent', () => {
    it('requests the item by id and emits it unchanged for non-poll items', fakeAsync(() => {
      const story = mockStory({ id: 8863 });
      let result: Story;

      service.fetchItemContent(8863).subscribe(data => (result = data));
      expect(lastRequest().url).toBe(`${BASE_URL}/item/8863`);

      lastRequest().respond(story);
      flushMicrotasks();

      expect(result).toEqual(story);
      expect(FakeXHR.requests.length).toBe(1);
    }));

    it('fetches each poll option and totals the votes for poll items', fakeAsync(() => {
      const poll = mockStory({
        id: 100,
        type: 'poll',
        poll: [mockPollResult({ points: 0 }), mockPollResult({ points: 0 })]
      });
      let result: Story;

      service.fetchItemContent(100).subscribe(data => (result = data));
      lastRequest().respond(poll);
      flushMicrotasks();

      expect(FakeXHR.requests.map(r => r.url)).toEqual([
        `${BASE_URL}/item/100`,
        `${BASE_URL}/item/101`,
        `${BASE_URL}/item/102`
      ]);
      expect(result.poll_votes_count).toBe(0);

      const optionA = mockPollResult({ points: 30, content: 'Tabs' });
      const optionB = mockPollResult({ points: 12, content: 'Spaces' });
      FakeXHR.requests[1].respond(optionA);
      FakeXHR.requests[2].respond(optionB);
      flushMicrotasks();

      expect(result.poll).toEqual([optionA, optionB]);
      expect(result.poll_votes_count).toBe(42);
    }));
  });

  describe('fetchPollContent', () => {
    it('requests the poll option item and emits it', fakeAsync(() => {
      const option = mockPollResult({ points: 7 });
      let result: PollResult;

      service.fetchPollContent(555).subscribe(data => (result = data));
      expect(lastRequest().url).toBe(`${BASE_URL}/item/555`);

      lastRequest().respond(option);
      flushMicrotasks();

      expect(result).toEqual(option);
    }));
  });

  describe('fetchUser', () => {
    it('requests the user by id and emits the profile', fakeAsync(() => {
      const user = mockUser({ id: 'dang' });
      let result: User;

      service.fetchUser('dang').subscribe(data => (result = data));
      expect(lastRequest().url).toBe(`${BASE_URL}/user/dang`);

      lastRequest().respond(user);
      flushMicrotasks();

      expect(result).toEqual(user);
    }));

    it('errors when the response body is not valid JSON', fakeAsync(() => {
      let error: Error;

      service.fetchUser('ghost').subscribe(fail, err => (error = err));
      const request = lastRequest();
      request.status = 404;
      request.responseText = 'Not Found';
      request.onload();
      flushMicrotasks();

      expect(error).toEqual(jasmine.any(SyntaxError));
    }));
  });
});
