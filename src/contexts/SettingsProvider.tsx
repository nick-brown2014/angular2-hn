import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Settings } from '../models/settings';
import { SettingsContext } from './settingsContext';

function getInitialSettings(): Settings {
    const savedTheme = localStorage.getItem('theme');
    let theme = 'default';
    if (savedTheme) {
        theme = savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'night';
    }

    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme,
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event: MediaQueryListEvent) => {
            setSettings((previous) => {
                const theme = event.matches ? 'night' : 'default';
                localStorage.setItem('theme', theme);
                return { ...previous, theme };
            });
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((previous) => ({ ...previous, showSettings: !previous.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((previous) => {
            const value = !previous.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(value));
            return { ...previous, openLinkInNewTab: value };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setSettings((previous) => {
            localStorage.setItem('theme', theme);
            return { ...previous, theme };
        });
    }, []);

    const setFont = useCallback((size: string) => {
        setSettings((previous) => {
            localStorage.setItem('titleFontSize', size);
            return { ...previous, titleFontSize: size };
        });
    }, []);

    const setSpacing = useCallback((spacing: string) => {
        setSettings((previous) => {
            localStorage.setItem('listSpacing', spacing);
            return { ...previous, listSpacing: spacing };
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
            {children}
        </SettingsContext.Provider>
    );
}
