import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Settings } from '../models/settings';

type SettingsContextValue = {
  settings: Settings;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: string) => void;
  setFont: (size: string) => void;
  setSpacing: (space: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function initialSettings(): Settings {
  return {
    showSettings: false,
    openLinkInNewTab: JSON.parse(localStorage.getItem('openLinkInNewTab') ?? 'false') as boolean,
    theme: localStorage.getItem('theme') ?? 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const toggleSettings = useCallback(
    () => setSettings((current) => ({ ...current, showSettings: !current.showSettings })),
    []
  );
  const toggleOpenLinksInNewTab = useCallback(() => {
    const value = !settings.openLinkInNewTab;
    localStorage.setItem('openLinkInNewTab', JSON.stringify(value));
    setSettings((current) => ({ ...current, openLinkInNewTab: value }));
  }, [settings.openLinkInNewTab]);
  const setTheme = useCallback((theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((current) => ({ ...current, theme }));
  }, []);
  const setFont = useCallback((size: string) => {
    localStorage.setItem('titleFontSize', size);
    setSettings((current) => ({ ...current, titleFontSize: size }));
  }, []);
  const setSpacing = useCallback((space: string) => {
    localStorage.setItem('listSpacing', space);
    setSettings((current) => ({ ...current, listSpacing: space }));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (localStorage.getItem('theme') === null) {
      setSettings((current) => ({ ...current, theme: mq.matches ? 'night' : 'default' }));
    }
    const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [setTheme]);

  const value = useMemo(
    () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
    [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
