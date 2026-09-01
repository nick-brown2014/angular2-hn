import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let darkColorSchemeMedia: any;

  function colorSchemeEvent(matches: boolean): MediaQueryListEvent {
    return { matches } as MediaQueryListEvent;
  }

  beforeEach(() => {
    store = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => (store[key] = value));

    darkColorSchemeMedia = {
      media: '(prefers-color-scheme: dark)',
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };
    spyOn(window, 'matchMedia').and.returnValue(darkColorSchemeMedia);
  });

  it('should be created with default settings', () => {
    const service = new SettingsService();

    expect(service).toBeTruthy();
    expect(service.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    });
  });

  it('should hydrate settings from localStorage', () => {
    store = {
      openLinkInNewTab: 'true',
      theme: 'night',
      titleFontSize: '20',
      listSpacing: '2'
    };

    const service = new SettingsService();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.theme).toBe('night');
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('2');
  });

  it('should listen for system color scheme changes', () => {
    const service = new SettingsService();

    expect(service.darkColorSchemeMedia).toBe(darkColorSchemeMedia);
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(darkColorSchemeMedia.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('should ask the media query for the current scheme when no theme is saved', () => {
    const service = new SettingsService();

    expect(service.settings.theme).toBe('default');
    expect(darkColorSchemeMedia.dispatchEvent).toHaveBeenCalled();
  });

  it('should not ask the media query for the current scheme when a theme is saved', () => {
    store = { theme: 'night' };

    const service = new SettingsService();

    expect(service.settings.theme).toBe('night');
    expect(darkColorSchemeMedia.dispatchEvent).not.toHaveBeenCalled();
  });

  it('should stop listening for system color scheme changes on destroy', () => {
    const service = new SettingsService();

    service.ngOnDestroy();

    expect(darkColorSchemeMedia.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  describe('with an instantiated service', () => {
    let service: SettingsService;

    beforeEach(() => {
      service = new SettingsService();
      (Storage.prototype.setItem as jasmine.Spy).calls.reset();
    });

    it('toggleSettings should flip the settings panel visibility', () => {
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
    });

    it('toggleOpenLinksInNewTab should flip the flag and persist it', () => {
      service.toggleOpenLinksInNewTab();

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

      service.toggleOpenLinksInNewTab();

      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
    });

    it('setTheme should store the theme', () => {
      service.setTheme('amoled');

      expect(service.settings.theme).toBe('amoled');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoled');
    });

    it('setFont should store the title font size', () => {
      service.setFont('22');

      expect(service.settings.titleFontSize).toBe('22');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
    });

    it('setSpacing should store the list spacing', () => {
      service.setSpacing('3');

      expect(service.settings.listSpacing).toBe('3');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '3');
    });

    it('handleSystemPreferredColorSchemeChange should switch to the night theme when dark is preferred', () => {
      service.handleSystemPreferredColorSchemeChange(colorSchemeEvent(true));

      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('handleSystemPreferredColorSchemeChange should switch to the default theme otherwise', () => {
      service.setTheme('night');

      service.handleSystemPreferredColorSchemeChange(colorSchemeEvent(false));

      expect(service.settings.theme).toBe('default');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
    });
  });
});
