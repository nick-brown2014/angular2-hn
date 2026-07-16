import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from '../contexts/SettingsProvider';
import type { User } from '../models/user';
import { UserPage } from '../pages/User/User';

function jsonResponse(data: unknown, ok = true, status = 200): Response {
    return {
        ok,
        status,
        json: () => Promise.resolve(data),
    } as unknown as Response;
}

function createUser(overrides: Partial<User> = {}): User {
    return {
        id: 'testuser',
        created_time: 1234567890,
        created: '2 years ago',
        karma: 1234,
        avg: 10,
        about: '<p>About <a href="https://example.com">this user</a>.</p>',
        ...overrides,
    };
}

function renderUser() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <SettingsProvider>
                <MemoryRouter initialEntries={['/user/testuser']}>
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
        localStorage.clear();
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the user profile details and about content', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(createUser()));

        renderUser();

        expect(await screen.findByText('testuser')).toBeInTheDocument();
        expect(screen.getByText(/1234/)).toBeInTheDocument();
        expect(screen.getByText('Created 2 years ago')).toBeInTheDocument();
        expect(screen.getByText(/About/)).toBeInTheDocument();
    });

    it('opens links in about content in a new tab when enabled', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(createUser()));

        renderUser();

        const link = await screen.findByRole('link', { name: 'this user' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('shows an error when the user request fails', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(null, false, 404));

        renderUser();

        expect(await screen.findByText('Could not load user testuser.')).toBeInTheDocument();
    });
});
