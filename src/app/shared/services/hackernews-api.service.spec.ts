import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { PollResult } from '../models/poll-result';

interface RecordedRequest {
  method: string;
  url: string;
}

/**
 * `unfetch` (used by the service via `lazyFetch`) is implemented on top of
 * XMLHttpRequest rather than the global `fetch`, so requests are intercepted by
 * spying on `XMLHttpRequest.prototype.open/send`. Only requests to the HN API
 * are faked; anything else (e.g. Karma's own transport) passes through.
 */
class FakeXMLHttpRequest {
  static baseUrl: string;
  static requests: RecordedRequest[] = [];
  static responses: { [url: string]: any } = {};
  static failUrls: string[] = [];

  private static urls = new WeakMap<XMLHttpRequest, RecordedRequest>();
  private static realOpen: (...args: any[]) => void;
  private static realSend: (body?: any) => void;

  static install(baseUrl: string) {
    FakeXMLHttpRequest.baseUrl = baseUrl;
    FakeXMLHttpRequest.requests = [];
    FakeXMLHttpRequest.responses = {};
    FakeXMLHttpRequest.failUrls = [];
    FakeXMLHttpRequest.realOpen = XMLHttpRequest.prototype.open;
    FakeXMLHttpRequest.realSend = XMLHttpRequest.prototype.send;

    spyOn(XMLHttpRequest.prototype, 'open').and.callFake(function(this: XMLHttpRequest, method: string, url: string) {
      if (url.indexOf(FakeXMLHttpRequest.baseUrl) === 0) {
        const request = { method, url };
        FakeXMLHttpRequest.urls.set(this, request);
        FakeXMLHttpRequest.requests.push(request);
        return;
      }
      return FakeXMLHttpRequest.realOpen.apply(this, arguments);
    });

    spyOn(XMLHttpRequest.prototype, 'send').and.callFake(function(this: XMLHttpRequest, body?: any) {
      const request = FakeXMLHttpRequest.urls.get(this);
      if (!request) {
        return FakeXMLHttpRequest.realSend.call(this, body);
      }
      setTimeout(() => FakeXMLHttpRequest.respond(this, request.url), 0);
    });
  }

  private static respond(xhr: XMLHttpRequest, url: string) {
    if (FakeXMLHttpRequest.failUrls.indexOf(url) !== -1) {
      xhr.onerror(new ProgressEvent('error'));
      return;
    }
    const body = FakeXMLHttpRequest.responses[url];
    const responseText = JSON.stringify(body === undefined ? null : body);
    const overrides = {
      status: 200,
      statusText: 'OK',
      responseURL: url,
      responseText,
      response: responseText,
      getAllResponseHeaders: () => 'content-type: application/json',
    };
    Object.keys(overrides).forEach(key =>
      Object.defineProperty(xhr, key, { value: overrides[key], configurable: true })
    );
    xhr.onload(new ProgressEvent('load'));
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;

  beforeEach(() => {
    FakeXMLHttpRequest.install(baseUrl);
    service = new HackerNewsAPIService();
  });

  it('should create with the expected baseUrl', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  describe('fetchFeed', () => {
    it('requests the feed URL and emits the parsed stories', (done) => {
      const stories = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }];
      FakeXMLHttpRequest.responses[`${baseUrl}/news?page=2`] = stories;

      service.fetchFeed('news', 2).subscribe(
        data => {
          expect(data).toEqual(stories as Story[]);
          expect(FakeXMLHttpRequest.requests.length).toBe(1);
          expect(FakeXMLHttpRequest.requests[0].url).toBe(`${baseUrl}/news?page=2`);
          expect(FakeXMLHttpRequest.requests[0].method.toLowerCase()).toBe('get');
        },
        done.fail,
        done
      );
    });

    it('errors the observable when the request fails', (done) => {
      FakeXMLHttpRequest.failUrls.push(`${baseUrl}/ask?page=1`);

      service.fetchFeed('ask', 1).subscribe(
        () => done.fail('expected an error'),
        err => {
          expect(err).toBeTruthy();
          done();
        }
      );
    });

    it('does not emit after unsubscribing', (done) => {
      FakeXMLHttpRequest.responses[`${baseUrl}/show?page=1`] = [];
      const next = jasmine.createSpy('next');

      const sub = service.fetchFeed('show', 1).subscribe(next);
      sub.unsubscribe();

      setTimeout(() => {
        expect(next).not.toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('fetchItemContent', () => {
    it('requests the item URL and emits the story', (done) => {
      const story = { id: 123, type: 'story', title: 'Hello' };
      FakeXMLHttpRequest.responses[`${baseUrl}/item/123`] = story;

      service.fetchItemContent(123).subscribe(
        data => {
          expect(data).toEqual(story as Story);
          expect(FakeXMLHttpRequest.requests.map(r => r.url)).toEqual([`${baseUrl}/item/123`]);
        },
        done.fail,
        done
      );
    });

    it('expands poll options via fetchPollContent and accumulates poll_votes_count', (done) => {
      const poll = { id: 100, type: 'poll', title: 'Pick one', poll: [{}, {}, {}] };
      const optionA: PollResult = { points: 5, content: 'A' };
      const optionB: PollResult = { points: 7, content: 'B' };
      const optionC: PollResult = { points: 1, content: 'C' };
      FakeXMLHttpRequest.responses[`${baseUrl}/item/100`] = poll;
      FakeXMLHttpRequest.responses[`${baseUrl}/item/101`] = optionA;
      FakeXMLHttpRequest.responses[`${baseUrl}/item/102`] = optionB;
      FakeXMLHttpRequest.responses[`${baseUrl}/item/103`] = optionC;
      spyOn(service, 'fetchPollContent').and.callThrough();

      service.fetchItemContent(100).subscribe(
        story => {
          expect(service.fetchPollContent).toHaveBeenCalledTimes(3);
          expect(service.fetchPollContent).toHaveBeenCalledWith(101);
          expect(service.fetchPollContent).toHaveBeenCalledWith(102);
          expect(service.fetchPollContent).toHaveBeenCalledWith(103);
          expect(story.poll_votes_count).toBe(0);

          // poll option requests resolve asynchronously after the story is emitted
          setTimeout(() => {
            expect(story.poll).toEqual([optionA, optionB, optionC]);
            expect(story.poll_votes_count).toBe(13);
            done();
          }, 10);
        },
        done.fail
      );
    });

    it('does not fetch poll options for non-poll stories', (done) => {
      FakeXMLHttpRequest.responses[`${baseUrl}/item/5`] = { id: 5, type: 'job' };
      spyOn(service, 'fetchPollContent').and.callThrough();

      service.fetchItemContent(5).subscribe(
        () => expect(service.fetchPollContent).not.toHaveBeenCalled(),
        done.fail,
        done
      );
    });
  });

  describe('fetchPollContent', () => {
    it('requests the item URL and emits the poll result', (done) => {
      const result: PollResult = { points: 3, content: 'Option' };
      FakeXMLHttpRequest.responses[`${baseUrl}/item/77`] = result;

      service.fetchPollContent(77).subscribe(
        data => {
          expect(data).toEqual(result);
          expect(FakeXMLHttpRequest.requests[0].url).toBe(`${baseUrl}/item/77`);
        },
        done.fail,
        done
      );
    });
  });

  describe('fetchUser', () => {
    it('requests the user URL and emits the user', (done) => {
      const user = { id: 'pg', karma: 1000 };
      FakeXMLHttpRequest.responses[`${baseUrl}/user/pg`] = user;

      service.fetchUser('pg').subscribe(
        data => {
          expect(data).toEqual(jasmine.objectContaining(user));
          expect(FakeXMLHttpRequest.requests[0].url).toBe(`${baseUrl}/user/pg`);
        },
        done.fail,
        done
      );
    });
  });
});
