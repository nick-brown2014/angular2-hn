import { TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

const baseUrl = 'https://node-hnapi.herokuapp.com';

/**
 * `unfetch` (the `fetch` import in the service) is implemented on top of
 * XMLHttpRequest, so requests are intercepted by replacing the global XHR.
 */
class FakeXHR {
  static instances: FakeXHR[] = [];
  static responses: { [url: string]: any } = {};
  static failUrls: string[] = [];

  method: string;
  url: string;
  status = 0;
  statusText = '';
  responseURL = '';
  responseText = '';
  response = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err: any) => void;

  constructor() {
    FakeXHR.instances.push(this);
  }

  static reset() {
    FakeXHR.instances = [];
    FakeXHR.responses = {};
    FakeXHR.failUrls = [];
  }

  static requestedUrls(): string[] {
    return FakeXHR.instances.map(xhr => xhr.url);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  send() {
    setTimeout(() => {
      if (FakeXHR.failUrls.indexOf(this.url) !== -1) {
        this.onerror(new Error('network failure'));
        return;
      }
      this.status = 200;
      this.statusText = 'OK';
      this.responseURL = this.url;
      this.responseText = JSON.stringify(FakeXHR.responses[this.url]);
      this.response = this.responseText;
      this.onload();
    }, 0);
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  const realXHR = window.XMLHttpRequest;

  beforeEach(() => {
    FakeXHR.reset();
    (window as any).XMLHttpRequest = FakeXHR;
    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = realXHR;
  });

  it('uses the node-hnapi base url', () => {
    expect(service.baseUrl).toBe(baseUrl);
  });

  describe('fetchFeed', () => {
    it('requests the feed for the given type and page and emits the parsed body', (done) => {
      const stories = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }];
      FakeXHR.responses[`${baseUrl}/news?page=2`] = stories;

      service.fetchFeed('news', 2).subscribe(
        items => {
          expect(items).toEqual(stories as Story[]);
          expect(FakeXHR.requestedUrls()).toEqual([`${baseUrl}/news?page=2`]);
          expect(FakeXHR.instances[0].method).toBe('get');
        },
        done.fail,
        done
      );
    });

    it('is lazy: nothing is requested until subscribed', () => {
      const feed$ = service.fetchFeed('ask', 1);
      expect(FakeXHR.instances.length).toBe(0);
      feed$.subscribe();
      expect(FakeXHR.instances.length).toBe(1);
    });

    it('errors the observable when the request fails', (done) => {
      FakeXHR.failUrls.push(`${baseUrl}/show?page=1`);

      service.fetchFeed('show', 1).subscribe(
        () => done.fail('expected an error'),
        err => {
          expect(err).toEqual(jasmine.any(Error));
          done();
        }
      );
    });

    it('does not emit after unsubscribing', (done) => {
      FakeXHR.responses[`${baseUrl}/jobs?page=1`] = [];
      const next = jasmine.createSpy('next');
      const sub = service.fetchFeed('jobs', 1).subscribe(next);
      sub.unsubscribe();

      setTimeout(() => {
        expect(next).not.toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('fetchItemContent', () => {
    it('requests the item by id and passes non-poll stories through unchanged', (done) => {
      const story = { id: 42, type: 'link', title: 'Story', comments: [] };
      FakeXHR.responses[`${baseUrl}/item/42`] = story;

      service.fetchItemContent(42).subscribe(
        item => {
          expect(item).toEqual(story as any);
          expect(item.poll_votes_count).toBeUndefined();
          expect(FakeXHR.requestedUrls()).toEqual([`${baseUrl}/item/42`]);
        },
        done.fail,
        done
      );
    });

    it('fetches each poll option and accumulates the vote count for polls', (done) => {
      const poll = { id: 100, type: 'poll', title: 'Poll', poll: [{}, {}] };
      FakeXHR.responses[`${baseUrl}/item/100`] = poll;
      FakeXHR.responses[`${baseUrl}/item/101`] = { points: 3, content: 'A' };
      FakeXHR.responses[`${baseUrl}/item/102`] = { points: 5, content: 'B' };

      service.fetchItemContent(100).subscribe(
        item => {
          expect(item.poll_votes_count).toBe(0);
          expect(FakeXHR.requestedUrls()).toEqual([
            `${baseUrl}/item/100`,
            `${baseUrl}/item/101`,
            `${baseUrl}/item/102`
          ]);

          setTimeout(() => {
            expect(item.poll).toEqual([
              { points: 3, content: 'A' },
              { points: 5, content: 'B' }
            ]);
            expect(item.poll_votes_count).toBe(8);
            done();
          }, 10);
        },
        done.fail
      );
    });

    it('errors the observable when the request fails', (done) => {
      FakeXHR.failUrls.push(`${baseUrl}/item/7`);

      service.fetchItemContent(7).subscribe(
        () => done.fail('expected an error'),
        err => {
          expect(err).toBeDefined();
          done();
        }
      );
    });
  });

  describe('fetchPollContent', () => {
    it('requests the poll option item by id', (done) => {
      FakeXHR.responses[`${baseUrl}/item/555`] = { points: 9, content: 'Option' };

      service.fetchPollContent(555).subscribe(
        result => {
          expect(result).toEqual({ points: 9, content: 'Option' });
          expect(FakeXHR.requestedUrls()).toEqual([`${baseUrl}/item/555`]);
        },
        done.fail,
        done
      );
    });
  });

  describe('fetchUser', () => {
    it('requests the user by id', (done) => {
      const user = { id: 'pg', karma: 1000, created: '10 years ago' };
      FakeXHR.responses[`${baseUrl}/user/pg`] = user;

      service.fetchUser('pg').subscribe(
        result => {
          expect(result).toEqual(user as any);
          expect(FakeXHR.requestedUrls()).toEqual([`${baseUrl}/user/pg`]);
        },
        done.fail,
        done
      );
    });

    it('errors the observable when the request fails', (done) => {
      FakeXHR.failUrls.push(`${baseUrl}/user/missing`);

      service.fetchUser('missing').subscribe(
        () => done.fail('expected an error'),
        err => {
          expect(err).toBeDefined();
          done();
        }
      );
    });
  });
});
