import { TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';

class MockXHR {
  static instances: MockXHR[] = [];
  static lastInstance(): MockXHR {
    return MockXHR.instances[MockXHR.instances.length - 1];
  }

  method = '';
  url = '';
  body: any = null;
  withCredentials = false;
  status = 200;
  statusText = 'OK';
  responseText = '{}';
  responseURL = '';
  response: any = '{}';
  onload: (() => void) | null = null;
  onerror: ((err?: any) => void) | null = null;

  constructor() {
    MockXHR.instances.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return '';
  }

  send(body: any) {
    this.body = body;
  }

  resolve(data: any) {
    this.responseText = JSON.stringify(data);
    if (this.onload) this.onload();
  }

  reject(err?: any) {
    if (this.onerror) this.onerror(err);
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXHR: any;

  beforeEach(() => {
    MockXHR.instances = [];
    originalXHR = (window as any).XMLHttpRequest;
    (window as any).XMLHttpRequest = MockXHR;

    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService]
    });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('exposes the expected baseUrl', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  it('fetchFeed() calls the correct URL and emits the parsed payload', (done) => {
    const payload = [{ id: 1, title: 'Story 1' }];

    service.fetchFeed('news', 1).subscribe((items: any) => {
      expect(items).toEqual(payload as any);
      done();
    });

    const xhr = MockXHR.lastInstance();
    expect(xhr).toBeDefined();
    expect(xhr.url).toBe('https://node-hnapi.herokuapp.com/news?page=1');
    xhr.resolve(payload);
  });

  it('fetchUser() calls the correct URL', (done) => {
    const payload = { id: 'testuser', karma: 42 };

    service.fetchUser('testuser').subscribe((user: any) => {
      expect(user).toEqual(payload as any);
      done();
    });

    const xhr = MockXHR.lastInstance();
    expect(xhr.url).toBe('https://node-hnapi.herokuapp.com/user/testuser');
    xhr.resolve(payload);
  });

  it('fetchItemContent() calls the correct URL', (done) => {
    const payload = { id: 123, type: 'story', title: 'An item' };

    service.fetchItemContent(123).subscribe((item: any) => {
      expect(item.id).toBe(123);
      done();
    });

    const xhr = MockXHR.lastInstance();
    expect(xhr.url).toBe('https://node-hnapi.herokuapp.com/item/123');
    xhr.resolve(payload);
  });

  it('fetchItemContent() resolves poll options for poll items', (done) => {
    const pollPayload = {
      id: 999,
      type: 'poll',
      title: 'A poll',
      poll: [null, null]
    };
    const optionPayload = { points: 5 };

    service.fetchItemContent(999).subscribe((item: any) => {
      expect(item.type).toBe('poll');
      done();
    });

    const xhr = MockXHR.instances[0];
    expect(xhr.url).toBe('https://node-hnapi.herokuapp.com/item/999');
    xhr.resolve(pollPayload);

    setTimeout(() => {
      MockXHR.instances.slice(1).forEach((pollXhr) => pollXhr.resolve(optionPayload));
    }, 0);
  });

  it('fetchPollContent() calls the correct URL', (done) => {
    const payload = { id: 124, points: 3 };

    service.fetchPollContent(124).subscribe((result: any) => {
      expect(result.points).toBe(3);
      done();
    });

    const xhr = MockXHR.lastInstance();
    expect(xhr.url).toBe('https://node-hnapi.herokuapp.com/item/124');
    xhr.resolve(payload);
  });

  it('emits an error on the observable when the underlying request fails', (done) => {
    const errorSpy = jasmine.createSpy('error');

    service.fetchFeed('news', 1).subscribe({
      next: () => {
        fail('expected an error, but got a value');
      },
      error: (err) => {
        errorSpy(err);
        expect(errorSpy).toHaveBeenCalled();
        done();
      }
    });

    const xhr = MockXHR.lastInstance();
    xhr.reject(new Error('network failure'));
  });
});
