import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

class FakeMediaQueryList extends EventTarget {
  readonly media = '(prefers-color-scheme: dark)';

  constructor(public matches: boolean) {
    super();
  }
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let media: FakeMediaQueryList;

  function createService(prefersDark = false): SettingsService {
    media = new FakeMediaQueryList(prefersDark);
    spyOn(window, 'matchMedia').and.returnValue(media as any);
    return TestBed.inject(SettingsService);
  }

  function dispatchColorScheme(matches: boolean) {
    media.dispatchEvent(new MediaQueryListEvent('change', { media: media.media, matches }));
  }

  beforeEach(() => {
    store = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => (store[key] = String(value)));
    TestBed.configureTestingModule({});
  });

  describe('defaults', () => {
    it('uses default values when nothing is stored', () => {
      const service = createService();
      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
      });
    });

    it('queries the dark color-scheme media feature', () => {
      createService();
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('picks and persists the Default theme for a light system preference', () => {
      const service = createService(false);
      expect(service.settings.theme).toBe('default');
      expect(store.theme).toBe('default');
    });

    it('picks and persists the Night theme for a dark system preference', () => {
      const service = createService(true);
      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
    });
  });

  describe('restoring from localStorage', () => {
    it('restores every persisted setting', () => {
      store = { theme: 'amoledblack', openLinkInNewTab: 'true', titleFontSize: '20', listSpacing: '8' };
      const service = createService();

      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: true,
        theme: 'amoledblack',
        titleFontSize: '20',
        listSpacing: '8',
      });
    });

    it('prefers a saved theme over the system preference', () => {
      store = { theme: 'default' };
      const service = createService(true);

      expect(service.settings.theme).toBe('default');
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });
  });

  describe('theme selection', () => {
    ['default', 'night', 'amoledblack'].forEach(theme => {
      it(`setTheme('${theme}') applies and persists the theme`, () => {
        const service = createService();
        service.setTheme(theme);
        expect(service.settings.theme).toBe(theme);
        expect(store.theme).toBe(theme);
      });
    });

    it('follows later system color-scheme changes', () => {
      const service = createService(false);

      dispatchColorScheme(true);
      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');

      dispatchColorScheme(false);
      expect(service.settings.theme).toBe('default');
      expect(store.theme).toBe('default');
    });
  });

  describe('other settings', () => {
    it('toggleSettings flips the panel visibility without persisting it', () => {
      const service = createService();
      (Storage.prototype.setItem as jasmine.Spy).calls.reset();

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });

    it('toggleOpenLinksInNewTab flips and persists the flag as JSON', () => {
      const service = createService();

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(store.openLinkInNewTab).toBe('true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(store.openLinkInNewTab).toBe('false');
    });

    it('setFont applies and persists the title font size', () => {
      const service = createService();
      service.setFont('22');
      expect(service.settings.titleFontSize).toBe('22');
      expect(store.titleFontSize).toBe('22');
    });

    it('setSpacing applies and persists the list spacing', () => {
      const service = createService();
      service.setSpacing('12');
      expect(service.settings.listSpacing).toBe('12');
      expect(store.listSpacing).toBe('12');
    });
  });
});
