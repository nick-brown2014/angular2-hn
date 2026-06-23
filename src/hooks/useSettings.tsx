import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Settings } from '../types/settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (size: string) => void;
    setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

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
        const handler = (e: MediaQueryListEvent) => {
            setSettings((prev) => {
                const newTheme = e.matches ? 'night' : 'default';
                localStorage.setItem('theme', newTheme);
                return { ...prev, theme: newTheme };
            });
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const val = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(val));
            return { ...prev, openLinkInNewTab: val };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        setSettings((prev) => {
            localStorage.setItem('theme', theme);
            return { ...prev, theme };
        });
    }, []);

    const setFont = useCallback((size: string) => {
        setSettings((prev) => {
            localStorage.setItem('titleFontSize', size);
            return { ...prev, titleFontSize: size };
        });
    }, []);

    const setSpacing = useCallback((spacing: string) => {
        setSettings((prev) => {
            localStorage.setItem('listSpacing', spacing);
            return { ...prev, listSpacing: spacing };
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
}
