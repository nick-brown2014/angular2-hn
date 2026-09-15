import { beforeEach, describe, expect, it, vi } from 'vitest';
import { baseUrl, fetchFeed, fetchItemContent } from './hackernews-api';

const story = (extra = {}) => ({ id: 1, title: 'Story', points: 1, user: 'user', time: 1, time_ago: '1 hour ago', type: 'story' as const, comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false, ...extra });

describe('hackernews api', () => {
  beforeEach(() => vi.restoreAllMocks());
  it('fetches a feed page', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetch);
    await fetchFeed('news', 2);
    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/news?page=2`);
  });
  it('hydrates poll options and vote count', async () => {
    const poll = story({ id: 100, type: 'poll', poll: [{ points: 0, content: '' }, { points: 0, content: '' }] });
    const first = { points: 3, content: 'one' }; const second = { points: 7, content: 'two' };
    const fetch = vi.fn().mockImplementation(async (url: string) => ({ ok: true, json: async () => url.endsWith('/101') ? first : url.endsWith('/102') ? second : poll }));
    vi.stubGlobal('fetch', fetch);
    const result = await fetchItemContent(100);
    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/item/101`); expect(fetch).toHaveBeenCalledWith(`${baseUrl}/item/102`); expect(result.poll).toEqual([first, second]); expect(result.poll_votes_count).toBe(10);
  });
  it('only fetches once for a non-poll story', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => story() }); vi.stubGlobal('fetch', fetch);
    await fetchItemContent(1); expect(fetch).toHaveBeenCalledTimes(1);
  });
});
