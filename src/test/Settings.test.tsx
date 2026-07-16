import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsProvider } from '../hooks/SettingsProvider';
import { useSettings } from '../hooks/useSettings';

function TestConsumer() {
    const { settings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    return (
        <div>
            <span data-testid="theme">{settings.theme}</span>
            <span data-testid="openLink">{String(settings.openLinkInNewTab)}</span>
            <span data-testid="fontSize">{settings.titleFontSize}</span>
            <span data-testid="spacing">{settings.listSpacing}</span>
            <button onClick={toggleOpenLinksInNewTab}>Toggle Links</button>
            <button onClick={() => setTheme('night')}>Night</button>
            <button onClick={() => setFont('20')}>Font 20</button>
            <button onClick={() => setSpacing('10')}>Spacing 10</button>
        </div>
    );
}

describe('Settings Context', () => {
    beforeEach(() => {
        localStorage.clear();
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: () =>
                ({
                    matches: false,
                    media: '(prefers-color-scheme: dark)',
                    onchange: null,
                    addListener: () => {},
                    removeListener: () => {},
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    dispatchEvent: () => false,
                }) as MediaQueryList,
        });
    });

    it('has correct defaults', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('openLink')).toHaveTextContent('false');
        expect(screen.getByTestId('fontSize')).toHaveTextContent('16');
        expect(screen.getByTestId('spacing')).toHaveTextContent('0');
    });

    it('persists theme to localStorage', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );

        fireEvent.click(screen.getByText('Night'));
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('persists openLinkInNewTab to localStorage', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );

        fireEvent.click(screen.getByText('Toggle Links'));
        expect(screen.getByTestId('openLink')).toHaveTextContent('true');
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('persists font size to localStorage', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );

        fireEvent.click(screen.getByText('Font 20'));
        expect(screen.getByTestId('fontSize')).toHaveTextContent('20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('persists spacing to localStorage', () => {
        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );

        fireEvent.click(screen.getByText('Spacing 10'));
        expect(screen.getByTestId('spacing')).toHaveTextContent('10');
        expect(localStorage.getItem('listSpacing')).toBe('10');
    });

    it('restores persisted settings', () => {
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '8');

        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );

        expect(screen.getByTestId('theme')).toHaveTextContent('amoledblack');
        expect(screen.getByTestId('fontSize')).toHaveTextContent('20');
        expect(screen.getByTestId('spacing')).toHaveTextContent('8');
    });

    it('tracks system color scheme changes', () => {
        let listener: ((event: MediaQueryListEvent) => void) | undefined;
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: vi.fn(
                () =>
                    ({
                        matches: false,
                        media: '(prefers-color-scheme: dark)',
                        onchange: null,
                        addListener: () => {},
                        removeListener: () => {},
                        addEventListener: (_type: string, callback: (event: MediaQueryListEvent) => void) => {
                            listener = callback;
                        },
                        removeEventListener: () => {},
                        dispatchEvent: () => false,
                    }) as MediaQueryList
            ),
        });

        render(
            <SettingsProvider>
                <TestConsumer />
            </SettingsProvider>
        );

        act(() => listener?.({ matches: true } as MediaQueryListEvent));
        expect(screen.getByTestId('theme')).toHaveTextContent('night');
        expect(localStorage.getItem('theme')).toBe('night');

        act(() => listener?.({ matches: false } as MediaQueryListEvent));
        expect(screen.getByTestId('theme')).toHaveTextContent('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });
});
