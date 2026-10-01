import { HackerNewsAPIService } from '../app/shared/services/hackernews-api.service';
import { SettingsService } from '../app/shared/services/settings.service';
import { Settings } from '../app/shared/models/settings';
import { Story } from '../app/shared/models/story';
import { Comment } from '../app/shared/models/comment';
import { User } from '../app/shared/models/user';

export function createSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
    ...overrides,
  };
}

export function createSettingsServiceSpy(settings: Settings = createSettings()): jasmine.SpyObj<SettingsService> {
  const spy = jasmine.createSpyObj<SettingsService>('SettingsService', [
    'toggleSettings',
    'toggleOpenLinksInNewTab',
    'setTheme',
    'setFont',
    'setSpacing',
    'initTheme',
  ]);
  spy.settings = settings;
  return spy;
}

export function createHackerNewsAPIServiceSpy(): jasmine.SpyObj<HackerNewsAPIService> {
  return jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', [
    'fetchFeed',
    'fetchItemContent',
    'fetchPollContent',
    'fetchUser',
  ]);
}

export function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'Show HN: A test story',
    points: 42,
    user: 'pg',
    time: 1160418111,
    time_ago: '2 hours ago',
    type: 'link',
    url: 'https://example.com/story',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    poll: undefined,
    poll_votes_count: undefined,
    deleted: false,
    dead: false,
    ...overrides,
  } as Story;
}

export function createComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 10,
    level: 0,
    user: 'sama',
    time: 1160423461,
    time_ago: '1 hour ago',
    content: '<p>A thoughtful comment</p>',
    deleted: false,
    comments: [],
    ...overrides,
  };
}

export function createUser(overrides: Partial<User> = {}): User {
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
