import { createContext } from 'react';
import type { Settings } from '../models/settings';

export interface SettingsContextValue {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (size: string) => void;
    setSpacing: (spacing: string) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
