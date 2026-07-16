import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent } from '../api/hackernews';

function jsonResponse(value: unknown): Response {
    return new Response(JSON.stringify(value), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('Hacker News API', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('fetches the requested feed page', async () => {
        const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([]));
        vi.stubGlobal('fetch', fetchMock);

        await expect(fetchFeed('show', 3)).resolves.toEqual([]);
        expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/show?page=3');
    });

    it('aggregates poll options and vote counts', async () => {
        const poll = {
            id: 100,
            title: 'Favorite option?',
            points: 5,
            user: 'pollster',
            time: 1,
            time_ago: 'now',
            type: 'poll',
            url: '',
            domain: '',
            comments: [],
            comments_count: 0,
            content: '',
            poll: [
                { points: 0, content: '' },
                { points: 0, content: '' },
            ],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        };
        const fetchMock = vi
            .fn<typeof fetch>()
            .mockResolvedValueOnce(jsonResponse(poll))
            .mockResolvedValueOnce(jsonResponse({ points: 4, content: 'First' }))
            .mockResolvedValueOnce(jsonResponse({ points: 6, content: 'Second' }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchItemContent(100);

        expect(result.poll).toEqual([
            { points: 4, content: 'First' },
            { points: 6, content: 'Second' },
        ]);
        expect(result.poll_votes_count).toBe(10);
        expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://node-hnapi.herokuapp.com/item/101');
        expect(fetchMock).toHaveBeenNthCalledWith(3, 'https://node-hnapi.herokuapp.com/item/102');
    });
});
