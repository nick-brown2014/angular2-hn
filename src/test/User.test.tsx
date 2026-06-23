import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserPage } from '../pages/User/User';
import { SettingsProvider } from '../hooks/useSettings';

vi.mock('../api/hackernews', () => ({
    fetchUser: vi.fn().mockResolvedValue({
        id: 'testdude',
        created_time: 1234567890,
        created: '10 years ago',
        karma: 5000,
        avg: 0,
        about: '<p>Hello world</p>',
    }),
}));

function renderUser(id = 'testdude') {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={[`/user/${id}`]}>
                    <Routes>
                        <Route path="/user/:id" element={<UserPage />} />
                    </Routes>
                </MemoryRouter>
            </SettingsProvider>
        </QueryClientProvider>
    );
}

describe('UserPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders user id', async () => {
        renderUser();
        await waitFor(() => {
            expect(screen.getAllByText('testdude').length).toBeGreaterThan(0);
        });
    });

    it('renders karma', async () => {
        renderUser();
        await waitFor(() => {
            expect(screen.getByText(/5000/)).toBeInTheDocument();
        });
    });

    it('renders creation date', async () => {
        renderUser();
        await waitFor(() => {
            expect(screen.getByText(/10 years ago/)).toBeInTheDocument();
        });
    });
});
