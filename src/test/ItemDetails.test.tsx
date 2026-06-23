import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItemDetails } from '../pages/ItemDetails/ItemDetails';
import { SettingsProvider } from '../hooks/useSettings';

vi.mock('../api/hackernews', () => ({
    fetchItemContent: vi.fn().mockResolvedValue({
        id: 42,
        title: 'Test Item',
        points: 200,
        user: 'itemuser',
        time: 1234567890,
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/item',
        domain: 'example.com',
        comments: [
            {
                id: 100,
                level: 0,
                user: 'commenter',
                time: 1234567890,
                time_ago: '1 hour ago',
                content: '<p>Great article!</p>',
                deleted: false,
                comments: [],
            },
        ],
        comments_count: 1,
        content: '<p>Item content here</p>',
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
    }),
}));

function renderItemDetails(id = '42') {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[`/item/${id}`]}>
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
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders item title', async () => {
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getAllByText('Test Item').length).toBeGreaterThan(0);
        });
    });

    it('renders comments', async () => {
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getByText('commenter')).toBeInTheDocument();
        });
    });

    it('renders item content', async () => {
        renderItemDetails();
        await waitFor(() => {
            expect(screen.getByText('Item content here')).toBeInTheDocument();
        });
    });
});
