import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

interface FakeMediaQueryList extends EventTarget {
  media: string;
  matches: boolean;
}

function createMediaQueryList(matches: boolean): FakeMediaQueryList {
  const mql = new EventTarget() as FakeMediaQueryList;
  mql.media = '(prefers-color-scheme: dark)';
  mql.matches = matches;
  return mql;
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let mediaQueryList: FakeMediaQueryList;

  function createService(): SettingsService {
    return TestBed.inject(SettingsService);
  }

  function emitColorSchemeChange(matches: boolean) {
    mediaQueryList.dispatchEvent(
      new MediaQueryListEvent('change', { media: mediaQueryList.media, matches })
    );
  }

  beforeEach(() => {
    store = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) =>
      key in store ? store[key] : null
    );
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = String(value);
    });

    mediaQueryList = createMediaQueryList(false);
    spyOn(window, 'matchMedia').and.callFake(() => mediaQueryList as unknown as MediaQueryList);

    TestBed.configureTestingModule({});
  });

  describe('initial settings', () => {
    it('uses defaults when nothing is stored', () => {
      const service = createService();

      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
      });
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('reads persisted values from localStorage', () => {
      store = { openLinkInNewTab: 'true', titleFontSize: '20', listSpacing: '8', theme: 'amoledblack' };

      const service = createService();

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('8');
      expect(service.settings.theme).toBe('amoledblack');
    });
  });

  describe('initTheme', () => {
    it('uses the saved theme when present', () => {
      store = { theme: 'night' };
      const service = createService();

      store.theme = 'amoledblack';
      service.initTheme();

      expect(service.settings.theme).toBe('amoledblack');
    });

    it('falls back to the system dark preference when no theme is saved', () => {
      mediaQueryList = createMediaQueryList(true);

      const service = createService();

      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
    });

    it('falls back to the default theme when the system prefers light', () => {
      const service = createService();

      expect(service.settings.theme).toBe('default');
      expect(store.theme).toBe('default');
    });
  });

  describe('system color scheme changes', () => {
    it('switches theme when prefers-color-scheme changes', () => {
      const service = createService();

      emitColorSchemeChange(true);
      expect(service.settings.theme).toBe('night');

      emitColorSchemeChange(false);
      expect(service.settings.theme).toBe('default');
    });
  });

  describe('toggleSettings', () => {
    it('toggles showSettings without persisting it', () => {
      const service = createService();
      (Storage.prototype.setItem as jasmine.Spy).calls.reset();

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });
  });

  describe('toggleOpenLinksInNewTab', () => {
    it('toggles and persists openLinkInNewTab as JSON', () => {
      const service = createService();

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(store.openLinkInNewTab).toBe('true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(store.openLinkInNewTab).toBe('false');
    });
  });

  describe('setTheme', () => {
    it('updates and persists the theme', () => {
      const service = createService();

      service.setTheme('amoledblack');

      expect(service.settings.theme).toBe('amoledblack');
      expect(store.theme).toBe('amoledblack');
    });
  });

  describe('setFont', () => {
    it('updates and persists the title font size', () => {
      const service = createService();

      service.setFont('22');

      expect(service.settings.titleFontSize).toBe('22');
      expect(store.titleFontSize).toBe('22');
    });
  });

  describe('setSpacing', () => {
    it('updates and persists the list spacing', () => {
      const service = createService();

      service.setSpacing('12');

      expect(service.settings.listSpacing).toBe('12');
      expect(store.listSpacing).toBe('12');
    });
  });
});
