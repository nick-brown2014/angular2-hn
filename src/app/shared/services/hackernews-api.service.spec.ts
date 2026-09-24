import { fakeAsync, tick } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { PollResult } from '../models/poll-result';
import { User } from '../models/user';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

/**
 * `unfetch` (imported as `fetch` in the service) is implemented on top of
 * XMLHttpRequest, so the network layer is intercepted by swapping the global
 * XMLHttpRequest for this fake. Each opened API URL is looked up in `responses`
 * and returned asynchronously as the JSON body. Requests to anything other than
 * the API (e.g. the test runner resolving source maps) are silently dropped.
 */
class FakeXMLHttpRequest {
  static requests: string[] = [];
  static responses: { [url: string]: any } = {};
  static failingUrls: string[] = [];

  status = 200;
  statusText = 'OK';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err: any) => void;
  private url: string;

  static reset() {
    FakeXMLHttpRequest.requests = [];
    FakeXMLHttpRequest.responses = {};
    FakeXMLHttpRequest.failingUrls = [];
  }

  open(method: string, url: string) {
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return '';
  }

  send() {
    if (this.url.indexOf(BASE_URL) !== 0) {
      return;
    }
    FakeXMLHttpRequest.requests.push(this.url);
    setTimeout(() => {
      if (FakeXMLHttpRequest.failingUrls.indexOf(this.url) !== -1) {
        this.onerror(new Error('network failure'));
        return;
      }
      const body = FakeXMLHttpRequest.responses[this.url];
      if (body === undefined) {
        this.onerror(new Error(`Unexpected request to ${this.url}`));
        return;
      }
      this.responseText = JSON.stringify(body);
      this.onload();
    }, 0);
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXHR: typeof XMLHttpRequest;

  beforeEach(() => {
    originalXHR = window.XMLHttpRequest;
    FakeXMLHttpRequest.reset();
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    window.XMLHttpRequest = originalXHR;
  });

  it('uses the node-hnapi base URL', () => {
    expect(service.baseUrl).toBe(BASE_URL);
  });

  describe('fetchFeed', () => {
    it('requests /{feedType}?page={page} and emits the parsed stories', fakeAsync(() => {
      const stories = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }];
      FakeXMLHttpRequest.responses[`${BASE_URL}/news?page=2`] = stories;

      let result: Story[];
      let completed = false;
      service.fetchFeed('news', 2).subscribe(items => result = items, fail, () => completed = true);
      tick();

      expect(FakeXMLHttpRequest.requests).toEqual([`${BASE_URL}/news?page=2`]);
      expect(result).toEqual(stories as Story[]);
      expect(completed).toBe(true);
    }));

    it('errors the observable when the request fails', fakeAsync(() => {
      FakeXMLHttpRequest.failingUrls.push(`${BASE_URL}/ask?page=1`);

      let error: any;
      service.fetchFeed('ask', 1).subscribe(() => fail('should not emit'), err => error = err);
      tick();

      expect(error).toBeTruthy();
    }));

    it('does not emit when unsubscribed before the response arrives', fakeAsync(() => {
      FakeXMLHttpRequest.responses[`${BASE_URL}/show?page=1`] = [];

      let emitted = false;
      const sub = service.fetchFeed('show', 1).subscribe(() => emitted = true);
      sub.unsubscribe();
      tick();

      expect(emitted).toBe(false);
    }));
  });

  describe('fetchItemContent', () => {
    it('requests /item/{id} and emits the story untouched for non-poll items', fakeAsync(() => {
      const story = { id: 123, type: 'link', title: 'A story', comments: [] };
      FakeXMLHttpRequest.responses[`${BASE_URL}/item/123`] = story;

      let result: Story;
      service.fetchItemContent(123).subscribe(item => result = item);
      tick();

      expect(FakeXMLHttpRequest.requests).toEqual([`${BASE_URL}/item/123`]);
      expect(result).toEqual(story as any);
      expect(result.poll_votes_count).toBeUndefined();
    }));

    it('fetches every poll option and accumulates poll_votes_count for polls', fakeAsync(() => {
      const poll = { id: 100, type: 'poll', title: 'Pick one', poll: [{}, {}, {}] };
      FakeXMLHttpRequest.responses[`${BASE_URL}/item/100`] = poll;
      FakeXMLHttpRequest.responses[`${BASE_URL}/item/101`] = { points: 5, content: 'A' };
      FakeXMLHttpRequest.responses[`${BASE_URL}/item/102`] = { points: 7, content: 'B' };
      FakeXMLHttpRequest.responses[`${BASE_URL}/item/103`] = { points: 1, content: 'C' };

      let result: Story;
      service.fetchItemContent(100).subscribe(item => result = item);
      tick();

      expect(FakeXMLHttpRequest.requests).toEqual([
        `${BASE_URL}/item/100`,
        `${BASE_URL}/item/101`,
        `${BASE_URL}/item/102`,
        `${BASE_URL}/item/103`
      ]);
      expect(result.poll).toEqual([
        { points: 5, content: 'A' },
        { points: 7, content: 'B' },
        { points: 1, content: 'C' }
      ] as PollResult[]);
      expect(result.poll_votes_count).toBe(13);
    }));
  });

  describe('fetchPollContent', () => {
    it('requests /item/{id}', fakeAsync(() => {
      FakeXMLHttpRequest.responses[`${BASE_URL}/item/55`] = { points: 3, content: 'opt' };

      let result: PollResult;
      service.fetchPollContent(55).subscribe(res => result = res);
      tick();

      expect(FakeXMLHttpRequest.requests).toEqual([`${BASE_URL}/item/55`]);
      expect(result).toEqual({ points: 3, content: 'opt' });
    }));
  });

  describe('fetchUser', () => {
    it('requests /user/{id}', fakeAsync(() => {
      const user = { id: 'pg', karma: 1000, created: '10 years ago' };
      FakeXMLHttpRequest.responses[`${BASE_URL}/user/pg`] = user;

      let result: User;
      service.fetchUser('pg').subscribe(res => result = res);
      tick();

      expect(FakeXMLHttpRequest.requests).toEqual([`${BASE_URL}/user/pg`]);
      expect(result).toEqual(user as User);
    }));
  });
});
