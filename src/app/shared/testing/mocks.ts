import { Settings } from '../models/settings';
import { SettingsService } from '../services/settings.service';
import { HackerNewsAPIService } from '../services/hackernews-api.service';
import { Story } from '../models/story';

export function createSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
    ...overrides
  };
}

export function createSettingsServiceSpy(overrides: Partial<Settings> = {}): jasmine.SpyObj<SettingsService> {
  const spy = jasmine.createSpyObj<SettingsService>('SettingsService', [
    'toggleSettings',
    'toggleOpenLinksInNewTab',
    'setTheme',
    'setFont',
    'setSpacing'
  ]);
  spy.settings = createSettings(overrides);
  return spy;
}

export function createHackerNewsAPIServiceSpy(): jasmine.SpyObj<HackerNewsAPIService> {
  return jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', [
    'fetchFeed',
    'fetchItemContent',
    'fetchPollContent',
    'fetchUser'
  ]);
}

export function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'An interesting story',
    points: 42,
    user: 'alice',
    time: 1600000000,
    time_ago: '2 hours ago',
    type: 'story',
    url: 'https://example.com/article',
    domain: 'example.com',
    comments: [],
    comments_count: 5,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides
  } as unknown as Story;
}
