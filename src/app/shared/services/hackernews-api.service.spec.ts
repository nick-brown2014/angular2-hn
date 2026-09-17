import { HackerNewsAPIService } from './hackernews-api.service';

const API_BASE_URL = 'https://node-hnapi.herokuapp.com';

/**
 * `unfetch` is implemented on top of XMLHttpRequest, so API requests are intercepted
 * by swapping in a fake XHR that resolves with the configured response. Requests to
 * any other URL (e.g. karma/jasmine internals) are passed through to the real XHR.
 */
class FakeXMLHttpRequest {
  static realXHR: typeof XMLHttpRequest;
  static requests: FakeXMLHttpRequest[] = [];
  static responseBody: any = null;
  static shouldFail = false;

  method: string;
  url: string;
  status = 200;
  statusText = 'OK';
  responseText = '';
  response = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err?: any) => void;
  private passthrough: XMLHttpRequest | null = null;

  static reset() {
    FakeXMLHttpRequest.requests = [];
    FakeXMLHttpRequest.responseBody = null;
    FakeXMLHttpRequest.shouldFail = false;
  }

  open(method: string, url: string, async?: boolean) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
    if (url.indexOf(API_BASE_URL) !== 0) {
      this.passthrough = new FakeXMLHttpRequest.realXHR();
      this.passthrough.open(method, url, async !== false);
      return;
    }
    FakeXMLHttpRequest.requests.push(this);
  }

  setRequestHeader(name: string, value: string) {
    if (this.passthrough) {
      this.passthrough.setRequestHeader(name, value);
    }
  }

  getAllResponseHeaders() {
    return this.passthrough ? this.passthrough.getAllResponseHeaders() : '';
  }

  send(body?: any) {
    if (this.passthrough) {
      const real = this.passthrough;
      real.withCredentials = this.withCredentials;
      real.onload = () => {
        this.status = real.status;
        this.statusText = real.statusText;
        this.responseText = real.responseText;
        this.response = real.response;
        this.responseURL = real.responseURL;
        if (this.onload) {
          this.onload();
        }
      };
      real.onerror = (err) => {
        if (this.onerror) {
          this.onerror(err);
        }
      };
      real.send(body);
      return;
    }
    setTimeout(() => {
      if (FakeXMLHttpRequest.shouldFail) {
        this.onerror(new Error('network failure'));
        return;
      }
      this.responseText = JSON.stringify(FakeXMLHttpRequest.responseBody);
      this.response = this.responseText;
      this.onload();
    }, 0);
  }

}

describe('HackerNewsAPIService', () => {
  const baseUrl = API_BASE_URL;
  let service: HackerNewsAPIService;
  let originalXHR: any;

  beforeEach(() => {
    FakeXMLHttpRequest.reset();
    originalXHR = (window as any).XMLHttpRequest;
    FakeXMLHttpRequest.realXHR = originalXHR;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('uses the node-hnapi base url', () => {
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('fetchFeed requests /{feedType}?page={page} and emits the data', (done) => {
    const stories = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }];
    FakeXMLHttpRequest.responseBody = stories;

    service.fetchFeed('news', 1).subscribe((data) => {
      expect(FakeXMLHttpRequest.requests.length).toBe(1);
      expect(FakeXMLHttpRequest.requests[0].url).toBe(`${baseUrl}/news?page=1`);
      expect(data).toEqual(stories as any);
      done();
    }, done.fail);
  });

  it('fetchItemContent requests /item/{id} and returns the story', (done) => {
    const story = { id: 123, title: 'Story', type: 'link', comments: [] };
    FakeXMLHttpRequest.responseBody = story;

    service.fetchItemContent(123).subscribe((data) => {
      expect(FakeXMLHttpRequest.requests[0].url).toBe(`${baseUrl}/item/123`);
      expect(data).toEqual(story as any);
      done();
    }, done.fail);
  });

  it('fetchItemContent initialises poll_votes_count and fetches poll options for polls', (done) => {
    const story = { id: 100, title: 'Poll', type: 'poll', poll: [{}, {}] };
    FakeXMLHttpRequest.responseBody = story;

    service.fetchItemContent(100).subscribe((data) => {
      expect(data.poll_votes_count).toBe(0);
      const urls = FakeXMLHttpRequest.requests.map((r) => r.url);
      expect(urls).toContain(`${baseUrl}/item/101`);
      expect(urls).toContain(`${baseUrl}/item/102`);
      FakeXMLHttpRequest.responseBody = { id: 101, points: 4 };
      setTimeout(() => {
        expect(data.poll_votes_count).toBe(8);
        expect(data.poll[0]).toEqual({ id: 101, points: 4 } as any);
        done();
      }, 0);
    }, done.fail);
  });

  it('fetchPollContent requests /item/{id}', (done) => {
    FakeXMLHttpRequest.responseBody = { id: 5, points: 10 };

    service.fetchPollContent(5).subscribe((data) => {
      expect(FakeXMLHttpRequest.requests[0].url).toBe(`${baseUrl}/item/5`);
      expect(data.points).toBe(10);
      done();
    }, done.fail);
  });

  it('fetchUser requests /user/{id}', (done) => {
    const user = { id: 'pg', karma: 1 };
    FakeXMLHttpRequest.responseBody = user;

    service.fetchUser('pg').subscribe((data) => {
      expect(FakeXMLHttpRequest.requests[0].url).toBe(`${baseUrl}/user/pg`);
      expect(data).toEqual(user as any);
      done();
    }, done.fail);
  });

  it('errors the observable when the request fails', (done) => {
    FakeXMLHttpRequest.shouldFail = true;

    service.fetchFeed('news', 1).subscribe(
      () => done.fail('expected an error'),
      (err) => {
        expect(err).toBeTruthy();
        done();
      }
    );
  });

  it('does not emit after unsubscribe', (done) => {
    FakeXMLHttpRequest.responseBody = [];
    const sub = service.fetchFeed('news', 1).subscribe(() => done.fail('should not emit'));
    sub.unsubscribe();
    setTimeout(() => {
      expect(sub.closed).toBe(true);
      done();
    }, 10);
  });
});
