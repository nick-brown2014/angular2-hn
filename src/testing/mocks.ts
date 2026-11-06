import { BehaviorSubject } from 'rxjs';
import { Params } from '@angular/router';

import { Comment } from '../app/shared/models/comment';
import { Settings } from '../app/shared/models/settings';
import { Story } from '../app/shared/models/story';
import { User } from '../app/shared/models/user';

// The node-hnapi responses send `time_ago` as a preformatted string, even though `Story.time_ago` is typed as number.
export type StoryFixture = Partial<Omit<Story, 'time_ago'>> & { time_ago?: string };

export function makeStory(overrides: StoryFixture = {}): Story {
  return {
    id: 1,
    title: 'A story',
    points: 42,
    user: 'pg',
    time: 1600000000,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/a-story',
    domain: 'example.com',
    comments: [],
    comments_count: 0,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides,
  } as unknown as Story;
}

export function makeStories(count: number, overrides: StoryFixture = {}): Story[] {
  return Array.from({ length: count }, (_, i) => makeStory({ id: i + 1, title: `Story ${i + 1}`, ...overrides }));
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 100,
    level: 0,
    user: 'dang',
    time: 1600000000,
    time_ago: '1 hour ago',
    content: '<p>A comment</p>',
    deleted: false,
    comments: [],
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'pg',
    crated_time: 1160418092,
    created: '19 years ago',
    karma: 155111,
    avg: 0,
    about: '<p>Bug fixer.</p>',
    ...overrides,
  };
}

export function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
    ...overrides,
  };
}

export function createSettingsServiceSpy(settings: Settings = makeSettings()) {
  const spy = jasmine.createSpyObj('SettingsService', [
    'toggleSettings',
    'toggleOpenLinksInNewTab',
    'setTheme',
    'setFont',
    'setSpacing',
  ]);
  spy.settings = settings;
  return spy;
}

export function createHackerNewsApiSpy() {
  return jasmine.createSpyObj('HackerNewsAPIService', [
    'fetchFeed',
    'fetchItemContent',
    'fetchPollContent',
    'fetchUser',
  ]);
}

export class ActivatedRouteStub {
  readonly params: BehaviorSubject<Params>;
  readonly data: BehaviorSubject<{ [key: string]: any }>;

  constructor(params: Params = {}, data: { [key: string]: any } = {}) {
    this.params = new BehaviorSubject(params);
    this.data = new BehaviorSubject(data);
  }
}

let fakeXhrRequests: FakeXhr[] = [];

// Minimal XMLHttpRequest replacement; `unfetch` (used by HackerNewsAPIService) is built on XHR, not window.fetch.
export class FakeXhr {
  method: string;
  url: string;
  status = 0;
  statusText = '';
  responseText = '';
  responseURL = '';
  withCredentials = false;
  sent = false;
  onload: () => void;
  onerror: (err: any) => void;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
    fakeXhrRequests.push(this);
  }

  setRequestHeader() {}

  send() {
    this.sent = true;
  }

  getAllResponseHeaders() {
    return 'content-type: application/json';
  }

  respond(body: any, status = 200) {
    this.status = status;
    this.responseText = typeof body === 'string' ? body : JSON.stringify(body);
    this.onload();
  }

  fail(err: any = new TypeError('Network request failed')) {
    this.onerror(err);
  }
}

export function installFakeXhr(): () => void {
  const original = (window as any).XMLHttpRequest;
  fakeXhrRequests = [];
  (window as any).XMLHttpRequest = FakeXhr;
  return () => {
    (window as any).XMLHttpRequest = original;
  };
}

export function xhrRequests(): FakeXhr[] {
  return fakeXhrRequests;
}

export function findXhr(url: string): FakeXhr {
  const request = fakeXhrRequests.find(r => r.url === url);
  if (!request) {
    throw new Error(`No request to ${url}; saw ${fakeXhrRequests.map(r => r.url).join(', ') || 'none'}`);
  }
  return request;
}
