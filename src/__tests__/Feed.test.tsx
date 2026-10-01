import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Feed from '../components/feeds/Feed';

describe('Feed', () => {
    it('renders loader initially', () => {
        render(
            <MemoryRouter initialEntries={['/news/1']}>
                <Feed feedType="news" />
            </MemoryRouter>
        );
        // The loader should be visible while data is being fetched
        expect(screen.getByText('Loading...')).toBeDefined();
    });
});
