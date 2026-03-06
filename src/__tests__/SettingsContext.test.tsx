import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

function SettingsConsumer() {
    const { settings } = useSettings();
    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="showSettings">{String(settings.showSettings)}</span>
            <span data-testid="openLinkInNewTab">{String(settings.openLinkInNewTab)}</span>
            <span data-testid="titleFontSize">{settings.titleFontSize}</span>
            <span data-testid="listSpacing">{settings.listSpacing}</span>
        </div>
    );
}

describe('SettingsContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('provides default values correctly', () => {
        render(
            <SettingsProvider>
                <SettingsConsumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('showSettings').textContent).toBe('false');
        expect(screen.getByTestId('openLinkInNewTab').textContent).toBe('false');
        expect(screen.getByTestId('titleFontSize').textContent).toBe('16');
        expect(screen.getByTestId('listSpacing').textContent).toBe('0');
    });

    it('throws error when useSettings is used outside SettingsProvider', () => {
        expect(() => {
            render(<SettingsConsumer />);
        }).toThrow('useSettings must be used within a SettingsProvider');
    });
});
