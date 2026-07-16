import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsPage } from '../pages/Settings/SettingsPage';
import { SettingsProvider } from '../contexts/SettingsProvider';
import { queryClient } from '../services';

function renderSettings() {
    return render(<QueryClientProvider client={queryClient}><SettingsProvider><MemoryRouter><SettingsPage /></MemoryRouter></SettingsProvider></QueryClientProvider>);
}

describe('settings', () => {
    beforeEach(() => localStorage.clear());

    it('restores the saved theme', () => {
        localStorage.setItem('theme', 'amoledblack');
        renderSettings();
        expect(screen.getByRole('radio', { name: /black \(amoled\)/i })).toBeChecked();
    });

    it('persists theme changes', () => {
        renderSettings();
        fireEvent.click(screen.getByRole('radio', { name: 'Night' }));
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('persists the open links preference', () => {
        renderSettings();
        fireEvent.click(screen.getByRole('checkbox', { name: /open links/i }));
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });
});
