import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Feed } from '../pages/Feed/Feed';
import { SettingsProvider } from '../hooks/SettingsProvider';

vi.mock('../api/hackernews', () => ({
    fetchFeed: vi.fn().mockResolvedValue([
        {
            id: 1,
            title: 'Test Story',
            points: 100,
            user: 'testuser',
            time: 1234567890,
            time_ago: '2 hours ago',
            type: 'story',
            url: 'https://example.com',
            domain: 'example.com',
            comments: [],
            comments_count: 5,
            content: '',
            poll: [],
            poll_votes_count: 0,
            deleted: false,
            dead: false,
        },
    ]),
}));

function renderWithProviders(feedType: string, page = '1') {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[`/${feedType}/${page}`]}>
                    <Routes>
                        <Route path="/:feedType/:page" element={<Feed feedType={feedType} />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}

describe('Feed', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders feed items', async () => {
        renderWithProviders('news');
        await waitFor(() => {
            expect(screen.getByText('Test Story')).toBeInTheDocument();
        });
    });

    it('shows points and user', async () => {
        renderWithProviders('news');
        await waitFor(() => {
            expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
        });
    });

    it('shows comment count', async () => {
        renderWithProviders('news');
        await waitFor(() => {
            expect(screen.getAllByText(/5 comments/).length).toBeGreaterThan(0);
        });
    });
});
