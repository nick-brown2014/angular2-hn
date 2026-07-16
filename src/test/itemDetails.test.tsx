import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from '../contexts/SettingsProvider';
import type { Comment, Story } from '../models';
import { ItemDetails } from '../pages/ItemDetails/ItemDetails';

function jsonResponse(data: unknown, ok = true, status = 200): Response {
    return {
        ok,
        status,
        json: () => Promise.resolve(data),
    } as unknown as Response;
}

function createComment(id: number, user: string, content: string, comments: Comment[] = []): Comment {
    return {
        id,
        level: 0,
        user,
        time: 1234567890,
        time_ago: '1 hour ago',
        content,
        deleted: false,
        comments,
    };
}

function createStory(overrides: Partial<Story> = {}): Story {
    return {
        id: 42,
        title: 'Test Item',
        points: 200,
        user: 'itemuser',
        time: 1234567890,
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/item',
        domain: 'example.com',
        comments: [],
        comments_count: 1,
        content: '<p>Item content here</p>',
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderItemDetails() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={['/item/42']}>
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetails />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}

describe('ItemDetails', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders story details and recursively nested comments', async () => {
        const grandchild = createComment(102, 'thirdcommenter', '<p>Third comment</p>');
        const child = createComment(101, 'secondcommenter', '<p>Second comment</p>', [grandchild]);
        const story = createStory({
            comments: [createComment(100, 'commenter', '<p>Great article!</p>', [child])],
            comments_count: 3,
        });
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(story));

        renderItemDetails();

        expect((await screen.findAllByText('Test Item')).length).toBeGreaterThan(0);
        expect(screen.getByText('itemuser')).toBeInTheDocument();
        expect(screen.getByText(/200 points/)).toBeInTheDocument();
        expect(screen.getByText('3 comments')).toBeInTheDocument();
        expect(screen.getByText('commenter')).toBeInTheDocument();
        expect(screen.getByText('secondcommenter')).toBeInTheDocument();
        expect(screen.getByText('thirdcommenter')).toBeInTheDocument();
    });

    it('collapses and expands a comment subtree', async () => {
        const child = createComment(101, 'secondcommenter', '<p>Second comment</p>');
        const story = createStory({
            comments: [createComment(100, 'commenter', '<p>Great article!</p>', [child])],
        });
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(story));

        renderItemDetails();

        expect(await screen.findByText('Great article!')).toBeInTheDocument();
        expect(screen.getByText('Second comment')).toBeInTheDocument();

        fireEvent.click(screen.getAllByText('[-]')[0]);
        expect(screen.queryByText('Great article!')).not.toBeInTheDocument();
        expect(screen.queryByText('Second comment')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('[+]'));
        expect(screen.getByText('Great article!')).toBeInTheDocument();
        expect(screen.getByText('Second comment')).toBeInTheDocument();
    });

    it('renders poll options, points, and proportional bars', async () => {
        const story = createStory({
            type: 'poll',
            poll: [
                { points: 0, content: '' },
                { points: 0, content: '' },
            ],
            poll_votes_count: 0,
        });
        vi.mocked(fetch)
            .mockResolvedValueOnce(jsonResponse(story))
            .mockResolvedValueOnce(jsonResponse({ content: '<p>Option One</p>', points: 3 }))
            .mockResolvedValueOnce(jsonResponse({ content: '<p>Option Two</p>', points: 1 }));

        const { container } = renderItemDetails();

        expect(await screen.findByText('Option One')).toBeInTheDocument();
        expect(screen.getByText('Option Two')).toBeInTheDocument();
        expect(screen.getByText('3 points')).toBeInTheDocument();
        expect(screen.getByText('1 points')).toBeInTheDocument();
        expect(container.querySelector('[class*="pollBar"]')).toHaveStyle({ width: '75%' });
    });

    it('renders deleted comments without their content', async () => {
        const story = createStory({
            comments: [
                {
                    ...createComment(100, 'commenter', '<p>Hidden deleted content</p>'),
                    deleted: true,
                },
            ],
        });
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(story));

        renderItemDetails();

        expect(await screen.findByText(/Comment Deleted/)).toBeInTheDocument();
        expect(screen.queryByText('Hidden deleted content')).not.toBeInTheDocument();
    });

    it('shows the loader while the item request is pending', () => {
        vi.mocked(fetch).mockReturnValueOnce(new Promise(() => {}));

        renderItemDetails();

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows an error when the item request fails', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(null, false, 500));

        renderItemDetails();

        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });
});
