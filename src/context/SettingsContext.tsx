import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from 'react';
import { Settings } from '../models/settings';

interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpacing: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function getInitialSettings(): Settings {
    const storedOpenLink = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: storedOpenLink ? JSON.parse(storedOpenLink) : false,
        theme: 'default',
        titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
        listSpacing: localStorage.getItem('listSpacing') ?? '0',
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...prev, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((prev) => ({ ...prev, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((prev) => ({ ...prev, listSpacing }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? 'night' : 'default');
        };

        darkColorSchemeMedia.addEventListener('change', handleChange);

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setSettings((prev) => ({ ...prev, theme: savedTheme }));
        } else {
            setTheme(darkColorSchemeMedia.matches ? 'night' : 'default');
        }

        return () => {
            darkColorSchemeMedia.removeEventListener('change', handleChange);
        };
    }, [setTheme]);

    const value = useMemo(
        () => ({
            settings,
            toggleSettings,
            toggleOpenLinksInNewTab,
            setTheme,
            setFont,
            setSpacing,
        }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
