import { Injectable } from '@angular/core';

import { Settings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  settings: Settings = {
    showSettings: false,
    openLinkInNewTab: localStorage.getItem('openLinkInNewTab') ? JSON.parse(localStorage.getItem('openLinkInNewTab')!) : false,
    theme: 'default',
    titleFontSize: localStorage.getItem('titleFontSize') ?? '16',
    listSpacing: localStorage.getItem('listSpacing') ?? '0',
  };

  private darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  private boundHandler = this.handleSystemPreferredColorSchemeChange.bind(this);

  constructor() {
    this.subscribeToSystemPreferredColorScheme();
    this.initTheme();
  }

  handleSystemPreferredColorSchemeChange(event: MediaQueryListEvent): void {
    const theme = event.matches ? 'night' : 'default';
    this.setTheme(theme);
  }

  subscribeToSystemPreferredColorScheme(): void {
    this.darkColorSchemeMedia.addEventListener('change', this.boundHandler);
  }

  initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.settings.theme = savedTheme;
    } else {
      this.darkColorSchemeMedia.dispatchEvent(
        new MediaQueryListEvent('change', {
          media: this.darkColorSchemeMedia.media,
          matches: this.darkColorSchemeMedia.matches
        })
      );
    }
  }

  toggleSettings(): void {
    this.settings.showSettings = !this.settings.showSettings;
  }

  toggleOpenLinksInNewTab(): void {
    this.settings.openLinkInNewTab = !this.settings.openLinkInNewTab;
    localStorage.setItem('openLinkInNewTab', JSON.stringify(this.settings.openLinkInNewTab));
  }

  setTheme(theme: string): void {
    this.settings.theme = theme;
    localStorage.setItem('theme', this.settings.theme);
  }

  setFont(fontSize: string): void {
    this.settings.titleFontSize = fontSize;
    localStorage.setItem('titleFontSize', this.settings.titleFontSize);
  }

  setSpacing(listSpace: string): void {
    this.settings.listSpacing = listSpace;
    localStorage.setItem('listSpacing', this.settings.listSpacing);
  }
}
