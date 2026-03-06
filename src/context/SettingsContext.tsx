import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Settings } from '../models/settings';

interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (size: string) => void;
    setSpacing: (spacing: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function getInitialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: localStorage.getItem('openLinkInNewTab')
            ? JSON.parse(localStorage.getItem('openLinkInNewTab')!)
            : false,
        theme: localStorage.getItem('theme') || 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const initial = getInitialSettings();
        // If no saved theme, check system preference
        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            initial.theme = prefersDark ? 'night' : 'default';
        }
        return initial;
    });

    // Listen to system color scheme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = event.matches ? 'night' : 'default';
                setSettings((prev) => ({ ...prev, theme: newTheme }));
            }
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const newVal = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(newVal));
            return { ...prev, openLinkInNewTab: newVal };
        });
    }, []);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    const setFont = useCallback((size: string) => {
        localStorage.setItem('titleFontSize', size);
        setSettings((prev) => ({ ...prev, titleFontSize: size }));
    }, []);

    const setSpacing = useCallback((spacing: string) => {
        localStorage.setItem('listSpacing', spacing);
        setSettings((prev) => ({ ...prev, listSpacing: spacing }));
    }, []);

    return (
        <SettingsContext.Provider
            value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
