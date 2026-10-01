import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

const STORAGE_KEYS = ['theme', 'openLinkInNewTab', 'titleFontSize', 'listSpacing'];

function createColorSchemeMedia(prefersDark: boolean): MediaQueryList {
  const media = new EventTarget() as MediaQueryList;
  Object.defineProperties(media, {
    media: { value: '(prefers-color-scheme: dark)' },
    matches: { value: prefersDark }
  });
  return media;
}

describe('SettingsService', () => {
  let colorSchemeMedia: MediaQueryList;

  function createService(prefersDark = false): SettingsService {
    colorSchemeMedia = createColorSchemeMedia(prefersDark);
    spyOn(window, 'matchMedia').and.returnValue(colorSchemeMedia);
    return TestBed.inject(SettingsService);
  }

  function emitColorSchemeChange(matches: boolean) {
    colorSchemeMedia.dispatchEvent(
      new MediaQueryListEvent('change', { media: colorSchemeMedia.media, matches })
    );
  }

  beforeEach(() => {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  });

  describe('defaults', () => {
    it('starts with default settings when nothing is persisted', () => {
      const service = createService();

      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      });
    });

    it('queries the system dark color scheme preference', () => {
      createService();
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('uses the night theme when the system prefers a dark color scheme', () => {
      const service = createService(true);

      expect(service.settings.theme).toBe('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });
  });

  describe('persistence', () => {
    it('restores persisted settings from localStorage', () => {
      localStorage.setItem('openLinkInNewTab', 'true');
      localStorage.setItem('titleFontSize', '22');
      localStorage.setItem('listSpacing', '8');
      localStorage.setItem('theme', 'amoledblack');

      const service = createService();

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('22');
      expect(service.settings.listSpacing).toBe('8');
      expect(service.settings.theme).toBe('amoledblack');
    });

    it('prefers a saved theme over the system color scheme', () => {
      localStorage.setItem('theme', 'default');

      const service = createService(true);

      expect(service.settings.theme).toBe('default');
    });

    it('never persists the settings panel visibility', () => {
      const service = createService();
      service.toggleSettings();

      expect(localStorage.getItem('showSettings')).toBeNull();
    });
  });

  describe('theme switching', () => {
    it('setTheme updates and persists the theme', () => {
      const service = createService();

      service.setTheme('amoledblack');

      expect(service.settings.theme).toBe('amoledblack');
      expect(localStorage.getItem('theme')).toBe('amoledblack');
    });

    it('follows system color scheme changes after initialization', () => {
      const service = createService(false);

      emitColorSchemeChange(true);
      expect(service.settings.theme).toBe('night');

      emitColorSchemeChange(false);
      expect(service.settings.theme).toBe('default');
      expect(localStorage.getItem('theme')).toBe('default');
    });

    it('removes its color scheme listener on destroy', () => {
      const service = createService();
      spyOn(colorSchemeMedia, 'removeEventListener');

      service.ngOnDestroy();

      expect(colorSchemeMedia.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('toggles', () => {
    it('toggleSettings flips showSettings', () => {
      const service = createService();

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
    });

    it('toggleOpenLinksInNewTab flips and persists openLinkInNewTab', () => {
      const service = createService();

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('setFont updates and persists titleFontSize', () => {
      const service = createService();

      service.setFont('20');

      expect(service.settings.titleFontSize).toBe('20');
      expect(localStorage.getItem('titleFontSize')).toBe('20');
    });

    it('setSpacing updates and persists listSpacing', () => {
      const service = createService();

      service.setSpacing('12');

      expect(service.settings.listSpacing).toBe('12');
      expect(localStorage.getItem('listSpacing')).toBe('12');
    });
  });
});
