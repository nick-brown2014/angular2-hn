import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let mediaQueryList: EventTarget & { media: string; matches: boolean };

  function createService(): SettingsService {
    return TestBed.inject(SettingsService);
  }

  beforeEach(() => {
    store = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => (store[key] = String(value)));

    mediaQueryList = Object.assign(new EventTarget(), { media: '(prefers-color-scheme: dark)', matches: false });
    spyOn(window, 'matchMedia').and.returnValue(mediaQueryList as any);

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

    it('listens to the prefers-color-scheme: dark media query', () => {
      createService();
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('uses the night theme when the system prefers a dark color scheme', () => {
      mediaQueryList.matches = true;
      const service = createService();

      expect(service.settings.theme).toBe('night');
      expect(store.theme).toBe('night');
    });
  });

  describe('restoring from localStorage', () => {
    it('restores persisted settings', () => {
      store = {
        openLinkInNewTab: 'true',
        theme: 'amoledblack',
        titleFontSize: '20',
        listSpacing: '8',
      };
      const service = createService();

      expect(service.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: true,
        theme: 'amoledblack',
        titleFontSize: '20',
        listSpacing: '8',
      });
    });

    it('prefers a saved theme over the system color scheme', () => {
      store.theme = 'default';
      mediaQueryList.matches = true;
      const service = createService();

      expect(service.settings.theme).toBe('default');
    });
  });

  describe('system color scheme changes', () => {
    it('switches theme when the system preference changes', () => {
      const service = createService();
      const dispatch = (matches: boolean) =>
        mediaQueryList.dispatchEvent(new MediaQueryListEvent('change', { media: mediaQueryList.media, matches }));

      dispatch(true);
      expect(service.settings.theme).toBe('night');

      dispatch(false);
      expect(service.settings.theme).toBe('default');
    });
  });

  describe('toggling and updating settings', () => {
    let service: SettingsService;

    beforeEach(() => {
      service = createService();
      (Storage.prototype.setItem as jasmine.Spy).calls.reset();
    });

    it('toggles the settings panel without persisting it', () => {
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    });

    it('toggles opening links in a new tab and persists it', () => {
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(Storage.prototype.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(store.openLinkInNewTab).toBe('false');
    });

    it('sets and persists the theme', () => {
      service.setTheme('amoledblack');
      expect(service.settings.theme).toBe('amoledblack');
      expect(Storage.prototype.setItem).toHaveBeenCalledWith('theme', 'amoledblack');
    });

    it('sets and persists the title font size', () => {
      service.setFont('22');
      expect(service.settings.titleFontSize).toBe('22');
      expect(Storage.prototype.setItem).toHaveBeenCalledWith('titleFontSize', '22');
    });

    it('sets and persists the list spacing', () => {
      service.setSpacing('12');
      expect(service.settings.listSpacing).toBe('12');
      expect(Storage.prototype.setItem).toHaveBeenCalledWith('listSpacing', '12');
    });

    it('round-trips persisted values into a new instance', () => {
      service.toggleOpenLinksInNewTab();
      service.setTheme('night');
      service.setFont('18');
      service.setSpacing('4');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const restored = createService();

      expect(restored.settings).toEqual({
        showSettings: false,
        openLinkInNewTab: true,
        theme: 'night',
        titleFontSize: '18',
        listSpacing: '4',
      });
    });
  });
});
