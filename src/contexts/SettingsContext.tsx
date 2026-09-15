import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
    listSpacing: localStorage.getItem('listSpacing') ?? '0'
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);

  const toggleSettings = () => setSettings((current) => ({ ...current, showSettings: !current.showSettings }));
  const toggleOpenLinksInNewTab = () => setSettings((current) => {
    const value = !current.openLinkInNewTab;
    localStorage.setItem('openLinkInNewTab', JSON.stringify(value));
    return { ...current, openLinkInNewTab: value };
  });
  const setTheme = (theme: string) => setSettings((current) => {
    localStorage.setItem('theme', theme);
    return { ...current, theme };
  });
  const setFont = (size: string) => setSettings((current) => {
    localStorage.setItem('titleFontSize', size);
    return { ...current, titleFontSize: size };
  });
  const setSpacing = (space: string) => setSettings((current) => {
    localStorage.setItem('listSpacing', space);
    return { ...current, listSpacing: space };
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (localStorage.getItem('theme') === null) {
      setSettings((current) => ({ ...current, theme: mq.matches ? 'night' : 'default' }));
    }
    const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const value = useMemo(() => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
