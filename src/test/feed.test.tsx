import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from '../contexts/SettingsProvider';
import { Feed } from '../pages/Feed/Feed';
import type { FeedSlug, Story } from '../models';

function jsonResponse(data: unknown, ok = true, status = 200): Response {
    return {
        ok,
        status,
        json: () => Promise.resolve(data),
    } as unknown as Response;
}

function createStory(id: number, overrides: Partial<Story> = {}): Story {
    return {
        id,
        title: `Story ${id}`,
        points: 100,
        user: 'testuser',
        time: 1234567890,
        time_ago: '2 hours ago',
        type: 'story',
        url: 'https://example.com/story',
        domain: 'example.com',
        comments: [],
        comments_count: 5,
        content: '',
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderFeed(feedType: FeedSlug = 'news', page = '1') {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
                    <Routes>
                        <Route path="/:feed/:page" element={<Feed feedType={feedType} />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders stories with title, author, points, and comment count', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([createStory(1)]));

        renderFeed();

        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/100/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/5 comments/).length).toBeGreaterThan(0);
    });

    it('shows the loader while the feed request is pending', () => {
        vi.mocked(fetch).mockReturnValueOnce(new Promise(() => {}));

        renderFeed();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows an error message when the feed request fails', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(null, false, 500));

        renderFeed('ask');

        expect(await screen.findByText('Could not load ask stories.')).toBeInTheDocument();
    });

    it('shows More on a full page and Prev on page two', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(Array.from({ length: 30 }, (_, index) => createStory(index + 1))));

        renderFeed('news', '1');

        expect(await screen.findByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/2');
        expect(screen.queryByRole('link', { name: /Prev/ })).not.toBeInTheDocument();

        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([createStory(31)]));
        renderFeed('news', '2');

        expect(await screen.findByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
    });

    it('opens external links in a new tab when the setting is enabled', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([createStory(1)]));

        renderFeed();

        expect(await screen.findByRole('link', { name: 'Story 1' })).toHaveAttribute('target', '_blank');
        expect(screen.getByRole('link', { name: 'Story 1' })).toHaveAttribute('rel', 'noopener');
    });

    it('does not open external links in a new tab by default', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([createStory(1)]));

        renderFeed();

        const storyLink = await screen.findByRole('link', { name: 'Story 1' });
        expect(storyLink).not.toHaveAttribute('target', '_blank');
        expect(storyLink).not.toHaveAttribute('rel', 'noopener');
    });
});
