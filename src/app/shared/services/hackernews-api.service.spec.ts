import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { findXhr, installFakeXhr, makeStory, xhrRequests } from '../../../testing/mocks';

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let restoreXhr: () => void;

  beforeEach(() => {
    restoreXhr = installFakeXhr();
    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => restoreXhr());

  it('targets the node-hnapi base URL', () => {
    expect(service.baseUrl).toBe(baseUrl);
  });

  describe('fetchFeed', () => {
    it('GETs /<feedType>?page=<page> and emits the parsed stories, then completes', fakeAsync(() => {
      const stories = [makeStory({ id: 1 }), makeStory({ id: 2 })];
      const next = jasmine.createSpy('next');
      const complete = jasmine.createSpy('complete');

      service.fetchFeed('newest', 3).subscribe(next, fail, complete);
      const request = findXhr(`${baseUrl}/newest?page=3`);
      expect(request.method).toBe('get');
      expect(request.sent).toBe(true);

      request.respond(stories);
      flushMicrotasks();

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(stories);
      expect(complete).toHaveBeenCalled();
    }));

    it('is lazy: no request is made until subscribed', () => {
      const feed$ = service.fetchFeed('news', 1);
      expect(xhrRequests().length).toBe(0);

      feed$.subscribe();
      expect(xhrRequests().length).toBe(1);
    });

    it('makes a new request for every subscription', () => {
      const feed$ = service.fetchFeed('news', 1);
      feed$.subscribe();
      feed$.subscribe();
      expect(xhrRequests().length).toBe(2);
    });

    it('errors when the request fails at the network level', fakeAsync(() => {
      const error = jasmine.createSpy('error');
      service.fetchFeed('news', 1).subscribe(fail, error);

      findXhr(`${baseUrl}/news?page=1`).fail();
      flushMicrotasks();

      expect(error).toHaveBeenCalled();
    }));

    it('errors when the response body is not valid JSON', fakeAsync(() => {
      const error = jasmine.createSpy('error');
      service.fetchFeed('news', 1).subscribe(fail, error);

      findXhr(`${baseUrl}/news?page=1`).respond('<html>Application Error</html>', 503);
      flushMicrotasks();

      expect(error).toHaveBeenCalledWith(jasmine.any(SyntaxError));
    }));

    it('drops the response if the subscriber unsubscribes before it arrives (request is not aborted)',
      fakeAsync(() => {
        const next = jasmine.createSpy('next');
        const complete = jasmine.createSpy('complete');
        const sub = service.fetchFeed('news', 1).subscribe(next, fail, complete);
        const request = findXhr(`${baseUrl}/news?page=1`);

        sub.unsubscribe();
        expect(request.sent).toBe(true);

        request.respond([makeStory()]);
        flushMicrotasks();

        expect(next).not.toHaveBeenCalled();
        expect(complete).not.toHaveBeenCalled();
      }));
  });

  describe('fetchItemContent', () => {
    it('GETs /item/<id> and emits the story unchanged for non-poll items', fakeAsync(() => {
      const story = makeStory({ id: 42, type: 'story', comments_count: 3 });
      let result: Story;

      service.fetchItemContent(42).subscribe(s => (result = s));
      findXhr(`${baseUrl}/item/42`).respond(story);
      flushMicrotasks();

      expect(result).toEqual(story);
      expect(xhrRequests().length).toBe(1);
    }));

    it('for polls, fetches each option at id+1..id+n and fills story.poll and poll_votes_count in place',
      fakeAsync(() => {
        const poll = makeStory({
          id: 100,
          type: 'poll',
          poll: [{ points: 0, content: '' }, { points: 0, content: '' }, { points: 0, content: '' }],
        });
        let result: Story;

        service.fetchItemContent(100).subscribe(s => (result = s));
        findXhr(`${baseUrl}/item/100`).respond(poll);
        flushMicrotasks();

        // The story is emitted before its options load; options are filled in on the same object later.
        expect(result.id).toBe(100);
        expect(result.poll_votes_count).toBe(0);
        expect(xhrRequests().map(r => r.url)).toEqual([
          `${baseUrl}/item/100`,
          `${baseUrl}/item/101`,
          `${baseUrl}/item/102`,
          `${baseUrl}/item/103`,
        ]);

        findXhr(`${baseUrl}/item/101`).respond({ points: 10, content: 'Yes' });
        findXhr(`${baseUrl}/item/102`).respond({ points: 5, content: 'No' });
        findXhr(`${baseUrl}/item/103`).respond({ points: 1, content: 'Maybe' });
        flushMicrotasks();

        expect(result.poll).toEqual([
          { points: 10, content: 'Yes' },
          { points: 5, content: 'No' },
          { points: 1, content: 'Maybe' },
        ]);
        expect(result.poll_votes_count).toBe(16);
      }));

    it('errors when the item request fails', fakeAsync(() => {
      const error = jasmine.createSpy('error');
      service.fetchItemContent(7).subscribe(fail, error);

      findXhr(`${baseUrl}/item/7`).fail();
      flushMicrotasks();

      expect(error).toHaveBeenCalled();
    }));
  });

  describe('fetchPollContent', () => {
    it('GETs /item/<id> and emits the poll option', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      service.fetchPollContent(55).subscribe(next);

      findXhr(`${baseUrl}/item/55`).respond({ points: 3, content: 'Option' });
      flushMicrotasks();

      expect(next).toHaveBeenCalledWith({ points: 3, content: 'Option' });
    }));
  });

  describe('fetchUser', () => {
    it('GETs /user/<id> and emits the user', fakeAsync(() => {
      const next = jasmine.createSpy('next');
      service.fetchUser('pg').subscribe(next);

      findXhr(`${baseUrl}/user/pg`).respond({ id: 'pg', karma: 100 });
      flushMicrotasks();

      expect(next).toHaveBeenCalledWith({ id: 'pg', karma: 100 });
    }));

    it('errors when the user endpoint returns a non-JSON 404 body', fakeAsync(() => {
      const error = jasmine.createSpy('error');
      service.fetchUser('nobody').subscribe(fail, error);

      findXhr(`${baseUrl}/user/nobody`).respond('Not Found', 404);
      flushMicrotasks();

      expect(error).toHaveBeenCalled();
    }));
  });
});
