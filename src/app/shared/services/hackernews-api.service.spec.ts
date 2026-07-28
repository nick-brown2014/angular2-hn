import { HackerNewsAPIService } from './hackernews-api.service';

class FakeXMLHttpRequest {
  static requests: FakeXMLHttpRequest[] = [];
  static responses: { [url: string]: any } = {};
  static failNext = false;

  status = 200;
  statusText = 'OK';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  onload: () => void;
  onerror: (err?: any) => void;
  url: string;
  method: string;

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
    FakeXMLHttpRequest.requests.push(this);
    if (FakeXMLHttpRequest.failNext) {
      // unfetch resolves on load and parses the body, so a malformed body rejects the promise
      this.responseText = 'not json';
      setTimeout(() => this.fireLoad());
      return;
    }
    const body = FakeXMLHttpRequest.responses[this.url];
    this.responseText = JSON.stringify(body === undefined ? {} : body);
    setTimeout(() => this.fireLoad());
  }

  private fireLoad() {
    if (typeof this.onload === 'function') {
      this.onload();
    }
  }
}

describe('HackerNewsAPIService', () => {
  const baseUrl = 'https://node-hnapi.herokuapp.com';
  let service: HackerNewsAPIService;
  let originalXHR: any;

  beforeEach(() => {
    originalXHR = (window as any).XMLHttpRequest;
    FakeXMLHttpRequest.requests = [];
    FakeXMLHttpRequest.responses = {};
    FakeXMLHttpRequest.failNext = false;
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;
    service = new HackerNewsAPIService();
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  const requestedUrls = () => FakeXMLHttpRequest.requests.map(r => r.url);

  it('should be created with the hnapi base url', () => {
    expect(service).toBeTruthy();
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('should fetch a feed page', done => {
    const stories = [{ id: 1, title: 'A story' }];
    FakeXMLHttpRequest.responses[`${baseUrl}/news?page=2`] = stories;

    service.fetchFeed('news', 2).subscribe(items => {
      expect(items as any).toEqual(stories as any);
      expect(requestedUrls()).toContain(`${baseUrl}/news?page=2`);
      done();
    });
  });

  it('should fetch a user', done => {
    const user = { id: 'pg', karma: 100 };
    FakeXMLHttpRequest.responses[`${baseUrl}/user/pg`] = user;

    service.fetchUser('pg').subscribe(data => {
      expect(data as any).toEqual(user as any);
      expect(requestedUrls()).toContain(`${baseUrl}/user/pg`);
      done();
    });
  });

  it('should fetch an item', done => {
    const story = { id: 42, type: 'link', title: 'Item' };
    FakeXMLHttpRequest.responses[`${baseUrl}/item/42`] = story;

    service.fetchItemContent(42).subscribe(item => {
      expect(item.id).toBe(42);
      expect(requestedUrls()).toContain(`${baseUrl}/item/42`);
      done();
    });
  });

  it('should expand poll options and accumulate the poll vote count', done => {
    const poll = { id: 10, type: 'poll', poll: [{}, {}] };
    FakeXMLHttpRequest.responses[`${baseUrl}/item/10`] = poll;
    FakeXMLHttpRequest.responses[`${baseUrl}/item/11`] = { id: 11, content: 'Option A', points: 3 };
    FakeXMLHttpRequest.responses[`${baseUrl}/item/12`] = { id: 12, content: 'Option B', points: 4 };

    service.fetchItemContent(10).subscribe(item => {
      setTimeout(() => {
        expect(requestedUrls()).toContain(`${baseUrl}/item/11`);
        expect(requestedUrls()).toContain(`${baseUrl}/item/12`);
        expect(item.poll[0].content).toBe('Option A');
        expect(item.poll[1].content).toBe('Option B');
        expect(item.poll_votes_count).toBe(7);
        done();
      }, 10);
    });
  });

  it('should propagate errors to the observer', done => {
    FakeXMLHttpRequest.failNext = true;

    service.fetchFeed('news', 1).subscribe(
      () => fail('expected an error'),
      error => {
        expect(error).toBeTruthy();
        done();
      }
    );
  });
});
