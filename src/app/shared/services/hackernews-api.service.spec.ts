import { TestBed } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';

interface MockXHR {
  open: jasmine.Spy;
  send: jasmine.Spy;
  setRequestHeader: jasmine.Spy;
  getAllResponseHeaders: () => string;
  onload: ((this: MockXHR) => void) | null;
  onerror: ((this: MockXHR, err?: any) => void) | null;
  status: number;
  statusText: string;
  responseText: string;
  responseURL: string;
  withCredentials: boolean;
}

// `unfetch` is the underlying fetch implementation (it uses XMLHttpRequest, not
// window.fetch), so we intercept network calls by replacing the XMLHttpRequest
// constructor for the duration of each test.
describe('HackerNewsAPIService', () => {
  let originalXHR: typeof XMLHttpRequest;
  let mockXHR: MockXHR;
  let xhrInstances: MockXHR[];
  let nextResponses: { [url: string]: { ok: boolean; data?: any; error?: any } };
  let service: HackerNewsAPIService;

  function makeMockXHR(): MockXHR {
    const xhr: MockXHR = {
      open: jasmine.createSpy('open'),
      send: jasmine.createSpy('send'),
      setRequestHeader: jasmine.createSpy('setRequestHeader'),
      getAllResponseHeaders: () => '',
      onload: null,
      onerror: null,
      status: 200,
      statusText: 'OK',
      responseText: '',
      responseURL: '',
      withCredentials: false
    };

    xhr.open.and.callFake((method: string, url: string) => {
      xhr.responseURL = url;
    });

    xhr.send.and.callFake(() => {
      // Simulate the network round-trip as a microtask so the unfetch Promise
      // resolves after the current test code has subscribed.
      Promise.resolve().then(() => {
        const response = nextResponses[xhr.responseURL];
        if (!response) {
          return;
        }
        if (response.ok) {
          xhr.status = 200;
          xhr.responseText = JSON.stringify(response.data);
          if (xhr.onload) {
            xhr.onload();
          }
        } else if (xhr.onerror) {
          xhr.onerror(response.error);
        }
      });
    });

    return xhr;
  }

  beforeEach(() => {
    nextResponses = {};
    xhrInstances = [];
    originalXHR = window.XMLHttpRequest;
    (window as any).XMLHttpRequest = function (this: any) {
      const instance = makeMockXHR();
      xhrInstances.push(instance);
      mockXHR = instance;
      return instance;
    };

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetchFeed should call fetch with the correct news URL', (done) => {
    const url = 'https://node-hnapi.herokuapp.com/news?page=1';
    nextResponses[url] = { ok: true, data: [{ id: 1 } as Story] };

    service.fetchFeed('news', 1).subscribe(items => {
      expect(items).toEqual([{ id: 1 } as Story]);
      expect(xhrInstances[0].open).toHaveBeenCalledWith('get', url, true);
      done();
    });
  });

  it('fetchFeed should call fetch with the correct show URL', (done) => {
    const url = 'https://node-hnapi.herokuapp.com/show?page=3';
    nextResponses[url] = { ok: true, data: [{ id: 99 } as Story] };

    service.fetchFeed('show', 3).subscribe(items => {
      expect(xhrInstances[0].open).toHaveBeenCalledWith('get', url, true);
      expect(items.length).toBe(1);
      done();
    });
  });

  it('fetchItemContent should call fetch with the correct item URL', (done) => {
    const url = 'https://node-hnapi.herokuapp.com/item/123';
    nextResponses[url] = { ok: true, data: { id: 123, type: 'story' } };

    service.fetchItemContent(123).subscribe(item => {
      expect(xhrInstances[0].open).toHaveBeenCalledWith('get', url, true);
      expect(item.id).toBe(123);
      done();
    });
  });

  it('fetchItemContent should request poll content for each poll option', (done) => {
    const baseId = 200;
    const itemUrl = `https://node-hnapi.herokuapp.com/item/${baseId}`;
    const pollOption1Url = `https://node-hnapi.herokuapp.com/item/${baseId + 1}`;
    const pollOption2Url = `https://node-hnapi.herokuapp.com/item/${baseId + 2}`;

    nextResponses[itemUrl] = {
      ok: true,
      data: {
        id: baseId,
        type: 'poll',
        poll: [
          { points: 0, content: 'Option A' },
          { points: 0, content: 'Option B' }
        ]
      }
    };
    nextResponses[pollOption1Url] = { ok: true, data: { points: 10, content: 'Option A' } };
    nextResponses[pollOption2Url] = { ok: true, data: { points: 5, content: 'Option B' } };

    service.fetchItemContent(baseId).subscribe(item => {
      expect(item.type).toBe('poll');
      // Allow the poll-option observables a tick to complete.
      setTimeout(() => {
        const requestedUrls = xhrInstances.map(x => x.responseURL);
        expect(requestedUrls).toContain(pollOption1Url);
        expect(requestedUrls).toContain(pollOption2Url);
        done();
      }, 0);
    });
  });

  it('fetchUser should call fetch with the correct user URL', (done) => {
    const url = 'https://node-hnapi.herokuapp.com/user/testuser';
    nextResponses[url] = { ok: true, data: { id: 'testuser', karma: 100 } };

    service.fetchUser('testuser').subscribe(user => {
      expect(xhrInstances[0].open).toHaveBeenCalledWith('get', url, true);
      expect(user.id).toBe('testuser');
      done();
    });
  });

  it('should emit an error when the underlying fetch rejects', (done) => {
    const url = 'https://node-hnapi.herokuapp.com/news?page=1';
    nextResponses[url] = { ok: false, error: new Error('network failure') };

    service.fetchFeed('news', 1).subscribe({
      next: () => fail('Expected error, got value'),
      error: (err) => {
        expect(err).toBeTruthy();
        done();
      }
    });
  });

  it('should not emit after unsubscribe (cancel token in lazyFetch)', (done) => {
    const url = 'https://node-hnapi.herokuapp.com/news?page=1';
    nextResponses[url] = { ok: true, data: [{ id: 1 } as Story] };

    let nextCalled = false;
    let completed = false;
    const subscription = service.fetchFeed('news', 1).subscribe(
      () => { nextCalled = true; },
      () => { /* ignore errors */ },
      () => { completed = true; }
    );

    // Unsubscribe before the queued microtask runs.
    subscription.unsubscribe();

    setTimeout(() => {
      expect(nextCalled).toBe(false);
      expect(completed).toBe(false);
      done();
    }, 10);
  });
});
