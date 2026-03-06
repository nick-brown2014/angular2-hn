import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Settings } from '../models/settings';

export interface SettingsContextType {
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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const initial = getInitialSettings();
    // If no saved theme, detect system preference
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initial.theme = prefersDark ? 'night' : 'default';
    }
    return initial;
  });

  useEffect(() => {
    const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const theme = event.matches ? 'night' : 'default';
        setSettings((prev) => ({ ...prev, theme }));
      }
    };

    darkColorSchemeMedia.addEventListener('change', handleChange);
    return () => {
      darkColorSchemeMedia.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleSettings = () => {
    setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
  };

  const toggleOpenLinksInNewTab = () => {
    setSettings((prev) => {
      const newValue = !prev.openLinkInNewTab;
      localStorage.setItem('openLinkInNewTab', JSON.stringify(newValue));
      return { ...prev, openLinkInNewTab: newValue };
    });
  };

  const setTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
    setSettings((prev) => ({ ...prev, theme }));
  };

  const setFont = (size: string) => {
    localStorage.setItem('titleFontSize', size);
    setSettings((prev) => ({ ...prev, titleFontSize: size }));
  };

  const setSpacing = (spacing: string) => {
    localStorage.setItem('listSpacing', spacing);
    setSettings((prev) => ({ ...prev, listSpacing: spacing }));
  };

  return (
    <SettingsContext.Provider
      value={{ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
