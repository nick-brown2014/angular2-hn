import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BASE_URL, fetchFeed, fetchItemContent, fetchUser } from '../services/hackerNews';
import type { Story } from '../models/story';

function jsonResponse(data: unknown, ok = true, status = 200): Response {
    return {
        ok,
        status,
        json: () => Promise.resolve(data),
    } as unknown as Response;
}

const fetchMock = vi.fn();

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('fetchFeed', () => {
    it('constructs the feed URL with feed slug and page and returns parsed items', async () => {
        const items = [{ id: 1, title: 'a' }];
        fetchMock.mockResolvedValueOnce(jsonResponse(items));

        const result = await fetchFeed('news', 2);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/news?page=2`);
        expect(result).toEqual(items);
    });

    it('throws when the response is not ok', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(null, false, 500));

        await expect(fetchFeed('ask', 1)).rejects.toThrow('Failed to fetch ask feed');
    });
});

describe('fetchItemContent', () => {
    it('requests the item endpoint and returns a non-poll story unchanged', async () => {
        const story: Partial<Story> = { id: 42, type: 'story', title: 'hello' };
        fetchMock.mockResolvedValueOnce(jsonResponse(story));

        const result = await fetchItemContent(42);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/item/42`);
        expect(result).toEqual(story);
    });

    it('aggregates poll option scores into poll_votes_count using sequential ids', async () => {
        const poll: Partial<Story> = {
            id: 100,
            type: 'poll',
            poll: [
                { points: 0, content: 'opt a' },
                { points: 0, content: 'opt b' },
            ],
        };
        fetchMock.mockResolvedValueOnce(jsonResponse(poll)); // item/100
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 10, content: 'opt a' })); // item/101
        fetchMock.mockResolvedValueOnce(jsonResponse({ points: 5, content: 'opt b' })); // item/102

        const result = await fetchItemContent(100);

        expect(fetchMock).toHaveBeenNthCalledWith(1, `${BASE_URL}/item/100`);
        expect(fetchMock).toHaveBeenNthCalledWith(2, `${BASE_URL}/item/101`);
        expect(fetchMock).toHaveBeenNthCalledWith(3, `${BASE_URL}/item/102`);
        expect(result.poll_votes_count).toBe(15);
        expect(result.poll).toEqual([
            { points: 10, content: 'opt a' },
            { points: 5, content: 'opt b' },
        ]);
    });

    it('does not fetch poll options for a poll with no options', async () => {
        const poll: Partial<Story> = { id: 7, type: 'poll', poll: [] };
        fetchMock.mockResolvedValueOnce(jsonResponse(poll));

        await fetchItemContent(7);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws when the item response is not ok', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(null, false, 404));

        await expect(fetchItemContent(1)).rejects.toThrow('Failed to fetch item 1');
    });
});

describe('fetchUser', () => {
    it('constructs the user URL and returns the parsed user', async () => {
        const user = { id: 'pg', karma: 100 };
        fetchMock.mockResolvedValueOnce(jsonResponse(user));

        const result = await fetchUser('pg');

        expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/user/pg`);
        expect(result).toEqual(user);
    });

    it('surfaces an error when the user endpoint returns 404', async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(null, false, 404));

        await expect(fetchUser('missing')).rejects.toThrow('Failed to fetch user missing');
    });
});
