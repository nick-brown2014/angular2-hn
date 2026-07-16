import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppLayout } from '../App';
import { SettingsProvider } from '../contexts/SettingsProvider';
import { queryClient } from '../services';

function renderPath(path: string) {
    return render(<QueryClientProvider client={queryClient}><SettingsProvider><MemoryRouter initialEntries={[path]}><AppLayout /></MemoryRouter></SettingsProvider></QueryClientProvider>);
}

describe('routing', () => {
    it('redirects the root to the news feed', () => {
        renderPath('/');
        expect(screen.getByText(/news feed/)).toBeInTheDocument();
    });

    it('renders the show feed', () => {
        renderPath('/show/1');
        expect(screen.getByText(/show feed/)).toBeInTheDocument();
        expect(screen.getByText(/page 1/)).toBeInTheDocument();
    });

    it('renders item details', async () => {
        renderPath('/item/42');
        expect(await screen.findByText(/Item 42/)).toBeInTheDocument();
    });

    it('renders the user page', async () => {
        renderPath('/user/pg');
        expect(await screen.findByText(/User pg/)).toBeInTheDocument();
    });

    it('renders settings', () => {
        renderPath('/settings');
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: /night/i })).toBeInTheDocument();
    });
});
