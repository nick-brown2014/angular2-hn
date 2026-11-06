import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

class FakeMediaQueryList extends EventTarget {
  constructor(public media: string, public matches: boolean) {
    super();
  }
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let media: FakeMediaQueryList;

  function createService(prefersDark = false): SettingsService {
    media = new FakeMediaQueryList('(prefers-color-scheme: dark)', prefersDark);
    spyOn(window, 'matchMedia').and.returnValue(media as any);
    return TestBed.inject(SettingsService);
  }

  function changeColorScheme(matches: boolean) {
    media.matches = matches;
    media.dispatchEvent(new MediaQueryListEvent('change', { media: media.media, matches }));
  }

  beforeEach(() => {
    store = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => (store[key] = String(value)));
    TestBed.configureTestingModule({});
  });

  describe('initial settings', () => {
    it('uses defaults when nothing is stored', () => {
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

    it('restores link, font and spacing preferences from localStorage', () => {
      store = { openLinkInNewTab: 'true', titleFontSize: '20', listSpacing: '8' };
      const service = createService();

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('8');
    });

    it('restores a saved theme and ignores the system color scheme', () => {
      store = { theme: 'amoledblack' };
      const service = createService(true);

      expect(service.settings.theme).toBe('amoledblack');
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });

    it('without a saved theme, follows a light system preference and persists it', () => {
      const service = createService(false);

      expect(service.settings.theme).toBe('default');
      expect(store.theme).toBe('default');
    });

    it('without a saved theme, follows a dark system preference and persists it', () => {
      const service = createService(true);

      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
    });
  });

  describe('system color scheme changes', () => {
    it('switches to night when the system goes dark and back to default when it goes light', () => {
      const service = createService(false);

      changeColorScheme(true);
      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');

      changeColorScheme(false);
      expect(service.settings.theme).toBe('default');
      expect(store.theme).toBe('default');
    });

    it('overrides a manually selected theme when the system scheme changes', () => {
      const service = createService(false);
      service.setTheme('amoledblack');

      changeColorScheme(true);

      expect(service.settings.theme).toBe('night');
    });

    it('calls removeEventListener for "change" on destroy', () => {
      const service = createService();
      spyOn(media, 'removeEventListener');

      service.ngOnDestroy();

      expect(media.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('mutators', () => {
    let service: SettingsService;

    beforeEach(() => {
      service = createService();
      (Storage.prototype.setItem as jasmine.Spy).calls.reset();
    });

    it('toggleSettings flips showSettings without persisting it', () => {
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });

    it('toggleOpenLinksInNewTab flips the flag and persists it as JSON', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(store.openLinkInNewTab).toBe('true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(store.openLinkInNewTab).toBe('false');
    });

    it('setTheme updates and persists the theme', () => {
      service.setTheme('amoledblack');

      expect(service.settings.theme).toBe('amoledblack');
      expect(store.theme).toBe('amoledblack');
    });

    it('setFont updates and persists the title font size', () => {
      service.setFont('22');

      expect(service.settings.titleFontSize).toBe('22');
      expect(store.titleFontSize).toBe('22');
    });

    it('setSpacing updates and persists the list spacing', () => {
      service.setSpacing('12');

      expect(service.settings.listSpacing).toBe('12');
      expect(store.listSpacing).toBe('12');
    });

    it('a new instance picks up values persisted by a previous one', () => {
      service.toggleOpenLinksInNewTab();
      service.setFont('18');
      service.setSpacing('6');
      service.setTheme('night');

      const reloaded = new SettingsService();

      expect(reloaded.settings).toEqual(jasmine.objectContaining({
        openLinkInNewTab: true,
        titleFontSize: '18',
        listSpacing: '6',
        theme: 'night',
      }));
    });
  });
});
