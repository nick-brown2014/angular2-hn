import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider } from '../../contexts/SettingsContext';
import { Feed } from './Feed';
import type { Story } from '../../models/story';
import { fetchFeed } from '../../services/hackernews-api';

vi.mock('../../services/hackernews-api', () => ({ fetchFeed: vi.fn() }));
const mockedFetchFeed = vi.mocked(fetchFeed);
const item = (id: number): Story => ({ id, title: `Story ${id}`, points: 1, user: 'user', time: 1, time_ago: '1 hour ago', type: 'story', comments: [], comments_count: 0, poll: [], poll_votes_count: 0, deleted: false, dead: false });

describe('Feed', () => {
  beforeEach(() => { localStorage.clear(); vi.stubGlobal('matchMedia', () => ({ matches: false, media: '', addEventListener: vi.fn(), removeEventListener: vi.fn() })); mockedFetchFeed.mockResolvedValue(Array.from({ length: 30 }, (_, i) => item(i + 1))); });
  it('renders pagination for a second page', async () => { render(<MemoryRouter initialEntries={['/news/2']}><SettingsProvider><Routes><Route path="/news/:page" element={<Feed feedType="news" />} /></Routes></SettingsProvider></MemoryRouter>); expect(await screen.findByRole('list')).toHaveAttribute('start', '31'); expect(screen.getByRole('link', { name: /prev/i })).toBeInTheDocument(); expect(screen.getByRole('link', { name: /more/i })).toHaveAttribute('href', '/news/3'); });
});
