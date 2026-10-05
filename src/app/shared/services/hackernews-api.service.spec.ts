import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

// The service uses `unfetch`, which is backed by XMLHttpRequest (not HttpClient or window.fetch),
// so requests are intercepted by swapping in a fake XMLHttpRequest.
class FakeXMLHttpRequest {
  static requests: FakeXMLHttpRequest[] = [];

  method: string;
  url: string;
  status = 0;
  statusText = '';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err: any) => void;

  constructor() {
    FakeXMLHttpRequest.requests.push(this);
  }

  static find(url: string): FakeXMLHttpRequest {
    return FakeXMLHttpRequest.requests.find(r => r.url === url);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  send() {}

  setRequestHeader() {}

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  respond(body: any, status = 200) {
    this.status = status;
    this.statusText = 'OK';
    this.responseText = JSON.stringify(body);
    this.onload();
  }

  fail(err: any) {
    this.onerror(err);
  }
}

const BASE_URL = 'https://node-hnapi.herokuapp.com';

const mockStories: Partial<Story>[] = [
  {
    id: 1,
    title: 'First story',
    points: 120,
    user: 'alice',
    time_ago: 2 as any,
    type: 'story',
    url: 'https://example.com/first',
    domain: 'example.com',
    comments_count: 10,
  },
  {
    id: 2,
    title: 'Ask HN: Second story',
    points: 42,
    user: 'bob',
    type: 'story',
    url: 'item?id=2',
    comments_count: 0,
  },
];

const mockStoryWithComments = {
  id: 1,
  title: 'First story',
  points: 120,
  user: 'alice',
  type: 'story',
  url: 'https://example.com/first',
  comments_count: 2,
  content: '',
  comments: [
    {
      id: 11,
      level: 0,
      user: 'carol',
      time_ago: '1 hour ago',
      content: '<p>Top level comment</p>',
      deleted: false,
      comments: [
        { id: 12, level: 1, user: 'dave', time_ago: '30 minutes ago', content: '<p>Reply</p>', deleted: false, comments: [] },
      ],
    },
  ],
};

const mockUser: User = {
  id: 'alice',
  crated_time: 1500000000,
  created: '7 years ago',
  karma: 1234,
  avg: null,
  about: 'Hello <i>world</i>',
};

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXHR: any;

  beforeEach(() => {
    originalXHR = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    FakeXMLHttpRequest.requests = [];

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('uses the node-hnapi base url', () => {
    expect(service.baseUrl).toBe(BASE_URL);
  });

  describe('fetchFeed', () => {
    it('requests the feed for the given type and page and emits the stories', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      const complete = jasmine.createSpy('complete');
      service.fetchFeed('news', 2).subscribe(next, fail, complete);

      expect(FakeXMLHttpRequest.requests.length).toBe(1);
      const req = FakeXMLHttpRequest.requests[0];
      expect(req.method).toBe('get');
      expect(req.url).toBe(`${BASE_URL}/news?page=2`);

      req.respond(mockStories);
      flushMicrotasks();

      expect(next).toHaveBeenCalledWith(mockStories);
      expect(complete).toHaveBeenCalled();
    }));

    it('builds the url from the feed type', () => {
      ['newest', 'show', 'ask', 'jobs'].forEach(feedType => service.fetchFeed(feedType, 1).subscribe());
      expect(FakeXMLHttpRequest.requests.map(r => r.url)).toEqual([
        `${BASE_URL}/newest?page=1`,
        `${BASE_URL}/show?page=1`,
        `${BASE_URL}/ask?page=1`,
        `${BASE_URL}/jobs?page=1`,
      ]);
    });

    it('is lazy and does not make a request until subscribed', () => {
      const feed$ = service.fetchFeed('news', 1);
      expect(FakeXMLHttpRequest.requests.length).toBe(0);
      feed$.subscribe();
      expect(FakeXMLHttpRequest.requests.length).toBe(1);
    });

    it('emits an error when the request fails', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      const error = jasmine.createSpy('error');
      service.fetchFeed('news', 1).subscribe(next, error);

      const networkError = new Error('network down');
      FakeXMLHttpRequest.requests[0].fail(networkError);
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledWith(networkError);
    }));

    it('does not emit after unsubscribing', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      const sub = service.fetchFeed('news', 1).subscribe(next);
      sub.unsubscribe();

      FakeXMLHttpRequest.requests[0].respond(mockStories);
      flushMicrotasks();

      expect(next).not.toHaveBeenCalled();
    }));
  });

  describe('fetchItemContent', () => {
    it('requests the item and emits the story with its comments', fakeAsync(() => {
      let story: Story;
      service.fetchItemContent(1).subscribe(s => (story = s));

      const req = FakeXMLHttpRequest.requests[0];
      expect(req.url).toBe(`${BASE_URL}/item/1`);
      req.respond(mockStoryWithComments);
      flushMicrotasks();

      expect(story).toEqual(mockStoryWithComments as any);
      expect(story.comments[0].user).toBe('carol');
      expect(story.comments[0].comments[0].content).toBe('<p>Reply</p>');
      expect(FakeXMLHttpRequest.requests.length).toBe(1);
    }));

    it('fetches each poll option and tallies the votes for polls', fakeAsync(() => {
      let story: Story;
      service.fetchItemContent(100).subscribe(s => (story = s));

      FakeXMLHttpRequest.find(`${BASE_URL}/item/100`).respond({
        id: 100,
        title: 'Poll: Tabs or spaces?',
        type: 'poll',
        url: 'item?id=100',
        poll: [{}, {}],
        comments: [],
      });
      flushMicrotasks();

      expect(story.poll_votes_count).toBe(0);
      const option1 = FakeXMLHttpRequest.find(`${BASE_URL}/item/101`);
      const option2 = FakeXMLHttpRequest.find(`${BASE_URL}/item/102`);
      expect(option1).toBeDefined();
      expect(option2).toBeDefined();

      const tabs: PollResult = { points: 30, content: 'Tabs' };
      const spaces: PollResult = { points: 70, content: 'Spaces' };
      option1.respond(tabs);
      option2.respond(spaces);
      flushMicrotasks();

      expect(story.poll).toEqual([tabs, spaces]);
      expect(story.poll_votes_count).toBe(100);
    }));

    it('emits an error when the request fails', fakeAsync(() => {
      const error = jasmine.createSpy('error');
      service.fetchItemContent(1).subscribe(fail, error);

      FakeXMLHttpRequest.requests[0].fail('boom');
      flushMicrotasks();

      expect(error).toHaveBeenCalledWith('boom');
    }));
  });

  describe('fetchPollContent', () => {
    it('requests the poll option item', fakeAsync(() => {
      let result: PollResult;
      service.fetchPollContent(101).subscribe(r => (result = r));

      const req = FakeXMLHttpRequest.requests[0];
      expect(req.url).toBe(`${BASE_URL}/item/101`);
      req.respond({ points: 5, content: 'Option' });
      flushMicrotasks();

      expect(result).toEqual({ points: 5, content: 'Option' });
    }));
  });

  describe('fetchUser', () => {
    it('requests the user profile and emits it', fakeAsync(() => {
      let user: User;
      service.fetchUser('alice').subscribe(u => (user = u));

      const req = FakeXMLHttpRequest.requests[0];
      expect(req.url).toBe(`${BASE_URL}/user/alice`);
      req.respond(mockUser);
      flushMicrotasks();

      expect(user).toEqual(mockUser);
    }));

    it('emits an error when the request fails', fakeAsync(() => {
      const error = jasmine.createSpy('error');
      service.fetchUser('nobody').subscribe(fail, error);

      FakeXMLHttpRequest.requests[0].fail('not found');
      flushMicrotasks();

      expect(error).toHaveBeenCalledWith('not found');
    }));
  });
});
