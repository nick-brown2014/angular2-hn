import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

class FakeMediaQueryList {
  media = '(prefers-color-scheme: dark)';
  private listeners: Array<(event: MediaQueryListEvent) => void> = [];

  constructor(public matches: boolean) {}

  addEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
    this.listeners.push(listener);
  }

  removeEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {}

  dispatchEvent(event: MediaQueryListEvent): boolean {
    this.listeners.forEach(listener => listener(event));
    return true;
  }
}

describe('SettingsService', () => {
  let mediaQueryList: FakeMediaQueryList;

  function createService(prefersDark = false): SettingsService {
    mediaQueryList = new FakeMediaQueryList(prefersDark);
    spyOn(window, 'matchMedia').and.returnValue(mediaQueryList as any);
    return TestBed.inject(SettingsService);
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial settings', () => {
    it('uses defaults when nothing is saved', () => {
      const service = createService();

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
      });
    });

    it('restores saved values from localStorage', () => {
      localStorage.setItem('openLinkInNewTab', 'true');
      localStorage.setItem('titleFontSize', '20');
      localStorage.setItem('listSpacing', '8');

      const service = createService();

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('8');
    });
  });

  describe('mutators', () => {
    let service: SettingsService;

    beforeEach(() => {
      service = createService();
      spyOn(localStorage, 'setItem').and.callThrough();
    });

    it('toggleSettings flips showSettings without persisting it', () => {
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('toggleOpenLinksInNewTab flips the flag and persists it', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });

    it('setTheme updates and persists the theme', () => {
      service.setTheme('amoledblack');

      expect(service.settings.theme).toBe('amoledblack');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoledblack');
    });

    it('setFont updates and persists the title font size', () => {
      service.setFont('22');

      expect(service.settings.titleFontSize).toBe('22');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
    });

    it('setSpacing updates and persists the list spacing', () => {
      service.setSpacing('12');

      expect(service.settings.listSpacing).toBe('12');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '12');
    });
  });

  describe('initTheme', () => {
    it('prefers a saved theme over the system color scheme', () => {
      localStorage.setItem('theme', 'amoledblack');

      const service = createService(true);

      expect(service.settings.theme).toBe('amoledblack');
    });

    it('falls back to the night theme when the system prefers dark', () => {
      const service = createService(true);

      expect(service.settings.theme).toBe('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });

    it('falls back to the default theme when the system prefers light', () => {
      const service = createService(false);

      expect(service.settings.theme).toBe('default');
      expect(localStorage.getItem('theme')).toBe('default');
    });
  });

  describe('system color scheme changes', () => {
    it('handleSystemPreferredColorSchemeChange maps matches to night/default', () => {
      const service = createService();

      service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('night');

      service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('default');
    });

    it('reacts to change events from the media query list', () => {
      localStorage.setItem('theme', 'default');
      const service = createService();

      mediaQueryList.dispatchEvent(
        new MediaQueryListEvent('change', { media: mediaQueryList.media, matches: true })
      );

      expect(service.settings.theme).toBe('night');
    });

    it('unsubscribes from the media query list on destroy', () => {
      const service = createService();
      spyOn(mediaQueryList, 'removeEventListener');

      service.ngOnDestroy();

      expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });
});
