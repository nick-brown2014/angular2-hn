import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { HackerNewsAPIService } from './hackernews-api.service';

// `unfetch` is backed by XMLHttpRequest, so requests are intercepted at that level
// to keep these tests free of any network access.
class FakeXMLHttpRequest {
  static requests: FakeXMLHttpRequest[] = [];
  static responseBody: any = {};

  status = 200;
  statusText = 'OK';
  responseURL = '';
  responseText = '';
  withCredentials = false;
  method: string;
  url: string;
  onload: () => void;
  onerror: (err?: any) => void;

  constructor() {
    FakeXMLHttpRequest.requests.push(this);
  }

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader() {}

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  send() {
    this.responseText = JSON.stringify(FakeXMLHttpRequest.responseBody);
    setTimeout(() => this.onload(), 0);
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let originalXHR: any;

  beforeEach(() => {
    originalXHR = (window as any).XMLHttpRequest;
    FakeXMLHttpRequest.requests = [];
    FakeXMLHttpRequest.responseBody = {};
    (window as any).XMLHttpRequest = FakeXMLHttpRequest;

    TestBed.configureTestingModule({ providers: [HackerNewsAPIService] });
    service = TestBed.inject(HackerNewsAPIService);
  });

  afterEach(() => {
    (window as any).XMLHttpRequest = originalXHR;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should point at the node-hnapi base url', () => {
    expect(service.baseUrl).toBe('https://node-hnapi.herokuapp.com');
  });

  it('should return observables without requesting anything until subscribed', () => {
    expect(service.fetchFeed('news', 1) instanceof Observable).toBe(true);
    expect(service.fetchItemContent(1) instanceof Observable).toBe(true);
    expect(service.fetchPollContent(1) instanceof Observable).toBe(true);
    expect(service.fetchUser('pg') instanceof Observable).toBe(true);
    expect(FakeXMLHttpRequest.requests.length).toBe(0);
  });

  it('should fetch a feed page and emit the stories', done => {
    const stories = [{ id: 1, title: 'A story' }];
    FakeXMLHttpRequest.responseBody = stories;

    service.fetchFeed('newest', 3).subscribe(items => {
      expect(items as any).toEqual(stories);
      expect(FakeXMLHttpRequest.requests[0].url).toBe('https://node-hnapi.herokuapp.com/newest?page=3');
      done();
    });
  });

  it('should fetch item content and emit the story', done => {
    const story = { id: 42, title: 'A story', type: 'story', url: 'https://example.com' };
    FakeXMLHttpRequest.responseBody = story;

    service.fetchItemContent(42).subscribe(item => {
      expect(item as any).toEqual(story);
      expect(FakeXMLHttpRequest.requests[0].url).toBe('https://node-hnapi.herokuapp.com/item/42');
      done();
    });
  });

  it('should fetch poll content', done => {
    const pollResult = { points: 12, content: 'An option' };
    FakeXMLHttpRequest.responseBody = pollResult;

    service.fetchPollContent(7).subscribe(result => {
      expect(result as any).toEqual(pollResult);
      expect(FakeXMLHttpRequest.requests[0].url).toBe('https://node-hnapi.herokuapp.com/item/7');
      done();
    });
  });

  it('should fetch a user', done => {
    const user = { id: 'pg', karma: 155000 };
    FakeXMLHttpRequest.responseBody = user;

    service.fetchUser('pg').subscribe(result => {
      expect(result as any).toEqual(user);
      expect(FakeXMLHttpRequest.requests[0].url).toBe('https://node-hnapi.herokuapp.com/user/pg');
      done();
    });
  });
});
