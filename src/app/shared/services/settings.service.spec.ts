import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let darkMode: MediaQueryList;

  function createMediaQueryList(matches: boolean): MediaQueryList {
    return Object.assign(new EventTarget(), {
      matches,
      media: '(prefers-color-scheme: dark)'
    }) as unknown as MediaQueryList;
  }

  function createService(options: { storage?: { [key: string]: string }, prefersDark?: boolean } = {}): SettingsService {
    store = { ...options.storage };
    darkMode = createMediaQueryList(!!options.prefersDark);
    spyOn(window, 'matchMedia').and.returnValue(darkMode);
    return TestBed.inject(SettingsService);
  }

  beforeEach(() => {
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => key in store ? store[key] : null);
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => store[key] = value);
    TestBed.configureTestingModule({});
  });

  describe('defaults', () => {
    it('should use default settings when nothing is stored and the system theme is light', () => {
      const service = createService();

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
    });

    it('should default to the night theme when the system prefers a dark color scheme', () => {
      const service = createService({ prefersDark: true });

      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
    });

    it('should restore persisted settings from localStorage', () => {
      const service = createService({
        prefersDark: true,
        storage: { openLinkInNewTab: 'true', titleFontSize: '20', listSpacing: '8', theme: 'amoledblack' }
      });

      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: true,
        theme: 'amoledblack',
        titleFontSize: '20',
        listSpacing: '8'
      });
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('updates', () => {
    let service: SettingsService;

    beforeEach(() => {
      service = createService({ storage: { theme: 'default' } });
    });

    it('should toggle the settings panel without persisting it', () => {
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should toggle and persist opening links in a new tab', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
    });

    it('should set and persist the theme', () => {
      service.setTheme('night');
      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');

      service.setTheme('amoledblack');
      expect(service.settings.theme).toBe('amoledblack');
      expect(store.theme).toBe('amoledblack');
    });

    it('should set and persist the title font size', () => {
      service.setFont('22');
      expect(service.settings.titleFontSize).toBe('22');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
    });

    it('should set and persist the list spacing', () => {
      service.setSpacing('12');
      expect(service.settings.listSpacing).toBe('12');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '12');
    });

    it('should follow changes to the system color scheme', () => {
      darkMode.dispatchEvent(new MediaQueryListEvent('change', { media: darkMode.media, matches: true }));
      expect(service.settings.theme).toBe('night');

      darkMode.dispatchEvent(new MediaQueryListEvent('change', { media: darkMode.media, matches: false }));
      expect(service.settings.theme).toBe('default');
      expect(store.theme).toBe('default');
    });

    it('should detach its color scheme listener on destroy', () => {
      spyOn(darkMode, 'removeEventListener');

      service.ngOnDestroy();

      expect(darkMode.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });
});
