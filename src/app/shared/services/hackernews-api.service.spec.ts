import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

/**
 * The service fetches through `unfetch`, which is backed by XMLHttpRequest, so requests
 * are intercepted at that level to keep the specs offline and deterministic. Only calls
 * to the Hacker News API are stubbed; anything else falls through to the real transport.
 */
describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let requestedUrls: string[];
  let bodies: { [url: string]: object };
  let failingUrls: string[];

  beforeEach(() => {
    requestedUrls = [];
    bodies = {};
    failingUrls = [];

    const realOpen = XMLHttpRequest.prototype.open;
    const realSend = XMLHttpRequest.prototype.send;

    spyOn(XMLHttpRequest.prototype, 'open').and.callFake(function(method: string, url: string) {
      this.stubbedUrl = url.indexOf(BASE_URL) === 0 ? url : null;
      if (!this.stubbedUrl) {
        realOpen.apply(this, arguments);
      }
    });

    spyOn(XMLHttpRequest.prototype, 'send').and.callFake(function() {
      const url: string = this.stubbedUrl;
      if (!url) {
        realSend.apply(this, arguments);
        return;
      }
      requestedUrls.push(url);
      // Settle in a microtask so a `setTimeout` in the spec sees every chained request.
      Promise.resolve().then(() => {
        if (failingUrls.indexOf(url) !== -1) {
          this.onerror(new Error('network down'));
          return;
        }
        Object.defineProperty(this, 'status', { value: 200, configurable: true });
        Object.defineProperty(this, 'responseText', {
          value: JSON.stringify(bodies[url]),
          configurable: true
        });
        this.onload();
      });
    });

    service = new HackerNewsAPIService();
  });

  it('points at the node-hnapi base url', () => {
    expect(service.baseUrl).toBe(BASE_URL);
  });

  it('fetches a paginated feed', done => {
    const stories = [{ id: 1, title: 'First' }, { id: 2, title: 'Second' }];
    bodies[`${BASE_URL}/news?page=2`] = stories;

    service.fetchFeed('news', 2).subscribe(items => {
      expect(items as any).toEqual(stories);
      expect(requestedUrls).toEqual([`${BASE_URL}/news?page=2`]);
      done();
    });
  });

  it('reports feed failures through the observable', done => {
    failingUrls.push(`${BASE_URL}/jobs?page=1`);

    service.fetchFeed('jobs', 1).subscribe(
      () => done.fail('expected the feed to error'),
      error => {
        expect(error).toBeTruthy();
        done();
      }
    );
  });

  it('fetches a user by id', done => {
    const user = { id: 'pg', karma: 155000 };
    bodies[`${BASE_URL}/user/pg`] = user;

    service.fetchUser('pg').subscribe(fetched => {
      expect(fetched as any).toEqual(user);
      expect(requestedUrls).toEqual([`${BASE_URL}/user/pg`]);
      done();
    });
  });

  it('fetches a single poll option', done => {
    const pollResult = { content: 'Option A', points: 12 };
    bodies[`${BASE_URL}/item/501`] = pollResult;

    service.fetchPollContent(501).subscribe(fetched => {
      expect(fetched as any).toEqual(pollResult);
      expect(requestedUrls).toEqual([`${BASE_URL}/item/501`]);
      done();
    });
  });

  it('returns a non-poll story untouched', done => {
    const story = { id: 42, title: 'A story', type: 'story' };
    bodies[`${BASE_URL}/item/42`] = story;

    service.fetchItemContent(42).subscribe(fetched => {
      expect(fetched as any).toEqual(story);
      expect(requestedUrls).toEqual([`${BASE_URL}/item/42`]);
      done();
    });
  });

  it('resolves poll options and accumulates the total vote count', done => {
    bodies[`${BASE_URL}/item/100`] = {
      id: 100,
      title: 'A poll',
      type: 'poll',
      poll: [{ content: 'placeholder', points: 0 }, { content: 'placeholder', points: 0 }]
    };
    bodies[`${BASE_URL}/item/101`] = { content: 'Option A', points: 7 };
    bodies[`${BASE_URL}/item/102`] = { content: 'Option B', points: 3 };

    let emitted: Story;
    service.fetchItemContent(100).subscribe(story => (emitted = story));

    setTimeout(() => {
      expect(emitted.id).toBe(100);
      expect(requestedUrls).toEqual([
        `${BASE_URL}/item/100`,
        `${BASE_URL}/item/101`,
        `${BASE_URL}/item/102`
      ]);
      expect(emitted.poll).toEqual([
        { content: 'Option A', points: 7 },
        { content: 'Option B', points: 3 }
      ] as any);
      expect(emitted.poll_votes_count).toBe(10);
      done();
    }, 0);
  });
});
