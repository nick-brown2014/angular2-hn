import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

const baseUrl = 'https://node-hnapi.herokuapp.com';

let requestedUrls: string[];
let responses: { [url: string]: any };
let failNextRequests: boolean;

// `unfetch` is implemented on top of XMLHttpRequest, so requests are stubbed at
// that level rather than through HttpClientTestingModule.
class FakeXMLHttpRequest {
  method: string;
  url: string;
  status = 200;
  statusText = 'OK';
  responseURL = '';
  responseText = '';
  withCredentials = false;
  onload: () => void;
  onerror: (error?: any) => void;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return '';
  }

  send() {
    if (this.url.indexOf(baseUrl) === 0) {
      requestedUrls.push(this.url);
    }
    Promise.resolve().then(() => {
      if (failNextRequests) {
        if (this.onerror) {
          this.onerror(new Error('network error'));
        }
        return;
      }
      this.responseText = JSON.stringify(responses[this.url] !== undefined ? responses[this.url] : {});
      if (this.onload) {
        this.onload();
      }
    });
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let nativeXhr: any;

  beforeEach(() => {
    requestedUrls = [];
    responses = {};
    failNextRequests = false;
    nativeXhr = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = nativeXhr;
  });

  it('is created with the hnapi base url', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('fetchFeed requests the feed page and emits the parsed stories', done => {
    const stories = [{ id: 1, title: 'Story one' }, { id: 2, title: 'Story two' }];
    responses[`${baseUrl}/news?page=2`] = stories;

    service.fetchFeed('news', 2).subscribe(items => {
      expect(requestedUrls).toEqual([`${baseUrl}/news?page=2`]);
      expect(items).toEqual(stories as any);
      done();
    });
  });

  it('fetchFeed errors when the request fails', done => {
    failNextRequests = true;

    service.fetchFeed('news', 1).subscribe(
      () => done.fail('expected an error'),
      error => {
        expect(error).toBeTruthy();
        done();
      }
    );
  });

  it('fetchItemContent requests a single item and emits it', done => {
    const story = { id: 42, title: 'An item', type: 'story' };
    responses[`${baseUrl}/item/42`] = story;

    service.fetchItemContent(42).subscribe(item => {
      expect(requestedUrls).toEqual([`${baseUrl}/item/42`]);
      expect(item).toEqual(story as any);
      done();
    });
  });

  it('fetchPollContent requests the poll option item', done => {
    responses[`${baseUrl}/item/7`] = { points: 12, content: 'Option' };

    service.fetchPollContent(7).subscribe(pollResult => {
      expect(requestedUrls).toEqual([`${baseUrl}/item/7`]);
      expect(pollResult.points).toBe(12);
      done();
    });
  });

  it('fetchUser requests the user profile', done => {
    responses[`${baseUrl}/user/pg`] = { id: 'pg', karma: 155 };

    service.fetchUser('pg').subscribe(user => {
      expect(requestedUrls).toEqual([`${baseUrl}/user/pg`]);
      expect(user.karma).toBe(155);
      done();
    });
  });

  it('fetchItemContent loads each poll option and accumulates the vote count', done => {
    responses[`${baseUrl}/item/100`] = {
      id: 100,
      type: 'poll',
      poll: [{ points: 0, content: '' }, { points: 0, content: '' }]
    };
    responses[`${baseUrl}/item/101`] = { points: 10, content: 'First option' };
    responses[`${baseUrl}/item/102`] = { points: 25, content: 'Second option' };

    service.fetchItemContent(100).subscribe((story: Story) => {
      // poll options resolve after the story itself, so wait one more turn
      setTimeout(() => {
        expect(requestedUrls).toEqual([
          `${baseUrl}/item/100`,
          `${baseUrl}/item/101`,
          `${baseUrl}/item/102`
        ]);
        expect(story.poll[0].content).toBe('First option');
        expect(story.poll[1].content).toBe('Second option');
        expect(story.poll_votes_count).toBe(35);
        done();
      }, 0);
    });
  });

  it('fetchItemContent does not fetch poll options for regular stories', done => {
    responses[`${baseUrl}/item/5`] = { id: 5, type: 'story', title: 'Regular' };

    service.fetchItemContent(5).subscribe(() => {
      setTimeout(() => {
        expect(requestedUrls).toEqual([`${baseUrl}/item/5`]);
        done();
      }, 0);
    });
  });
});
