import { fakeAsync, tick } from '@angular/core/testing';

import { HackerNewsAPIService } from './hackernews-api.service';
import { Story } from '../models/story';
import { User } from '../models/user';

const baseUrl = 'https://node-hnapi.herokuapp.com';

// `hackernews-api.service` calls `unfetch`, which is backed by XMLHttpRequest rather than
// the global `fetch`, so requests are intercepted by stubbing XMLHttpRequest itself.
class FakeXMLHttpRequest {
  static instances: FakeXMLHttpRequest[] = [];

  status = 200;
  statusText = 'OK';
  responseURL = '';
  responseText = '';
  withCredentials = false;
  method: string;
  url: string;
  onload: () => void;
  onerror: (error?: any) => void;

  static reset() {
    FakeXMLHttpRequest.instances = [];
  }

  static get last(): FakeXMLHttpRequest {
    return FakeXMLHttpRequest.instances[FakeXMLHttpRequest.instances.length - 1];
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

  send() {
    FakeXMLHttpRequest.instances.push(this);
  }

  respondWith(data: any) {
    this.responseText = JSON.stringify(data);
    this.onload();
  }

  fail() {
    this.onerror(new Error('network error'));
  }
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;

  beforeEach(() => {
    FakeXMLHttpRequest.reset();
    spyOn(window as any, 'XMLHttpRequest').and.callFake(() => new FakeXMLHttpRequest());
    service = new HackerNewsAPIService();
  });

  it('should default to the node-hnapi base url', () => {
    expect(service.baseUrl).toBe(baseUrl);
  });

  it('fetchFeed should request the paged feed and emit the stories', fakeAsync(() => {
    const stories = [{ id: 1, title: 'A story' }, { id: 2, title: 'Another story' }];
    const emitted: Story[][] = [];
    let completed = false;

    service.fetchFeed('news', 2).subscribe({
      next: items => emitted.push(items),
      complete: () => (completed = true)
    });

    expect(FakeXMLHttpRequest.instances.length).toBe(1);
    expect(FakeXMLHttpRequest.last.url).toBe(`${baseUrl}/news?page=2`);

    FakeXMLHttpRequest.last.respondWith(stories);
    tick();

    expect(emitted).toEqual([stories as any]);
    expect(completed).toBe(true);
  }));

  it('fetchItemContent should request the item and emit it', fakeAsync(() => {
    const story = { id: 42, title: 'An item', type: 'link' };
    let emitted: Story;

    service.fetchItemContent(42).subscribe(item => (emitted = item));

    expect(FakeXMLHttpRequest.last.url).toBe(`${baseUrl}/item/42`);

    FakeXMLHttpRequest.last.respondWith(story);
    tick();

    expect(emitted as any).toEqual(story);
  }));

  it('fetchItemContent should fetch each poll option and aggregate poll_votes_count', fakeAsync(() => {
    const story = { id: 100, type: 'poll', poll: [{}, {}] };
    let emitted: Story;

    service.fetchItemContent(100).subscribe(item => (emitted = item));

    expect(FakeXMLHttpRequest.last.url).toBe(`${baseUrl}/item/100`);

    FakeXMLHttpRequest.last.respondWith(story);
    tick();

    // one request per poll option, keyed off the story id
    expect(FakeXMLHttpRequest.instances.length).toBe(3);
    expect(FakeXMLHttpRequest.instances[1].url).toBe(`${baseUrl}/item/101`);
    expect(FakeXMLHttpRequest.instances[2].url).toBe(`${baseUrl}/item/102`);

    FakeXMLHttpRequest.instances[1].respondWith({ points: 12, content: 'First option' });
    FakeXMLHttpRequest.instances[2].respondWith({ points: 30, content: 'Second option' });
    tick();

    expect(emitted.poll).toEqual([
      { points: 12, content: 'First option' },
      { points: 30, content: 'Second option' }
    ] as any);
    expect(emitted.poll_votes_count).toBe(42);
  }));

  it('fetchPollContent should request a single poll option', fakeAsync(() => {
    const pollResult = { points: 7, content: 'An option' };
    let emitted;

    service.fetchPollContent(500).subscribe(result => (emitted = result));

    expect(FakeXMLHttpRequest.last.url).toBe(`${baseUrl}/item/500`);

    FakeXMLHttpRequest.last.respondWith(pollResult);
    tick();

    expect(emitted).toEqual(pollResult);
  }));

  it('fetchUser should request the user and emit it', fakeAsync(() => {
    const user = { id: 'pg', karma: 155000 };
    let emitted: User;

    service.fetchUser('pg').subscribe(result => (emitted = result));

    expect(FakeXMLHttpRequest.last.url).toBe(`${baseUrl}/user/pg`);

    FakeXMLHttpRequest.last.respondWith(user);
    tick();

    expect(emitted as any).toEqual(user);
  }));

  it('should emit an error when the request fails', fakeAsync(() => {
    let error: any;

    service.fetchFeed('news', 1).subscribe(() => {}, err => (error = err));

    FakeXMLHttpRequest.last.fail();
    tick();

    expect(error).toBeTruthy();
  }));
});
