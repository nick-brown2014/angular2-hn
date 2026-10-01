import { Comment } from '../shared/models/comment';
import { PollResult } from '../shared/models/poll-result';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';
import { User } from '../shared/models/user';

export function mockStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1001,
    title: 'Show HN: A tiny Hacker News reader',
    points: 128,
    user: 'pg',
    time: 1790852397,
    time_ago: 3,
    type: 'story',
    url: 'https://example.com/tiny-hn',
    domain: 'example.com',
    comments: [],
    comments_count: 12,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    ...overrides
  };
}

export function mockStories(count: number, overrides: Partial<Story> = {}): Story[] {
  return Array.from({ length: count }, (_, i) =>
    mockStory({ id: 2000 + i, title: `Story ${i + 1}`, user: `user${i + 1}`, ...overrides })
  );
}

export function mockComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 5001,
    level: 0,
    user: 'dang',
    time: 1790852500,
    time_ago: '2 hours ago',
    content: '<p>Great post!</p>',
    deleted: false,
    comments: [],
    ...overrides
  };
}

export function mockPollResult(overrides: Partial<PollResult> = {}): PollResult {
  return { points: 10, content: '<p>Option</p>', ...overrides };
}

export function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'pg',
    crated_time: 1160418092,
    created: '19 years ago',
    karma: 157316,
    avg: 0,
    about: '<p>Bug fixer.</p>',
    ...overrides
  };
}

export function mockSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
    ...overrides
  };
}
