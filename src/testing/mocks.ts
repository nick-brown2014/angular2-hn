import { Component } from '@angular/core';
import { ActivatedRoute, Data, Params } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { Comment } from '../app/shared/models/comment';
import { Settings } from '../app/shared/models/settings';
import { Story } from '../app/shared/models/story';
import { User } from '../app/shared/models/user';
import { HackerNewsAPIService } from '../app/shared/services/hackernews-api.service';
import { SettingsService } from '../app/shared/services/settings.service';

// The API returns `time_ago` as text (e.g. "3 hours ago"), although the Story model types it as a number.
export type StoryOverrides = Partial<Omit<Story, 'time_ago'>> & { time_ago?: string };

export function makeStory(overrides: StoryOverrides = {}): Story {
  return Object.assign(new Story(), {
    id: 1,
    title: 'Test story',
    points: 42,
    user: 'alice',
    time: 1600000000,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/article',
    domain: 'example.com',
    comments: [],
    comments_count: 5,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
  }, overrides) as unknown as Story;
}

export function makeStories(count: number, startId = 1): Story[] {
  return Array.from({ length: count }, (_, i) =>
    makeStory({ id: startId + i, title: `Story ${startId + i}` })
  );
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return Object.assign(new Comment(), {
    id: 100,
    level: 0,
    user: 'bob',
    time: 1600000000,
    time_ago: '1 hour ago',
    content: '<p>A comment</p>',
    deleted: false,
    comments: [],
  }, overrides);
}

export function makeUser(overrides: Partial<User> = {}): User {
  return Object.assign(new User(), {
    id: 'pg',
    crated_time: 1160418092,
    created: '20 years ago',
    karma: 157316,
    avg: 0,
    about: 'Bug fixer.',
  }, overrides);
}

export function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return Object.assign({
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
  }, overrides);
}

export type SettingsServiceStub = jasmine.SpyObj<SettingsService> & { settings: Settings };

export function createSettingsServiceStub(settings: Settings = makeSettings()): SettingsServiceStub {
  const stub = jasmine.createSpyObj<SettingsService>('SettingsService', [
    'toggleSettings',
    'toggleOpenLinksInNewTab',
    'setTheme',
    'setFont',
    'setSpacing',
  ]) as SettingsServiceStub;
  stub.settings = settings;
  return stub;
}

export function createHackerNewsApiStub(): jasmine.SpyObj<HackerNewsAPIService> {
  return jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', [
    'fetchFeed',
    'fetchItemContent',
    'fetchPollContent',
    'fetchUser',
  ]);
}

export class ActivatedRouteStub {
  readonly params = new BehaviorSubject<Params>({});
  readonly data = new BehaviorSubject<Data>({});

  constructor(params: Params = {}, data: Data = {}) {
    this.params.next(params);
    this.data.next(data);
  }

  setParams(params: Params) {
    this.params.next(params);
  }
}

export function provideActivatedRoute(route: ActivatedRouteStub) {
  return { provide: ActivatedRoute, useValue: route };
}

@Component({ template: '' })
export class BlankComponent {}
