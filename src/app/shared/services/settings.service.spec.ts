import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let fakeMedia: {
    media: string;
    matches: boolean;
    addEventListener: jasmine.Spy;
    removeEventListener: jasmine.Spy;
    dispatchEvent: jasmine.Spy;
  };

  function createService(): SettingsService {
    return new SettingsService();
  }

  beforeEach(() => {
    store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    );
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });

    fakeMedia = {
      media: '(prefers-color-scheme: dark)',
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
    };

    spyOn(window, 'matchMedia').and.returnValue(fakeMedia as any);
  });

  it('should be created', () => {
    expect(createService()).toBeTruthy();
  });

  it('subscribes to the system preferred color scheme on construction', () => {
    createService();
    expect(fakeMedia.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  describe('initTheme', () => {
    it('uses a saved theme from localStorage when present', () => {
      store.theme = 'night';
      const service = createService();
      expect(service.settings.theme).toBe('night');
      expect(fakeMedia.dispatchEvent).not.toHaveBeenCalled();
    });

    it('dispatches a change event to derive the theme when none is saved', () => {
      const service = createService();
      expect(service.settings.theme).toBe('default');
      expect(fakeMedia.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe('toggleSettings', () => {
    it('flips showSettings', () => {
      const service = createService();
      expect(service.settings.showSettings).toBe(false);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
    });
  });

  describe('toggleOpenLinksInNewTab', () => {
    it('flips openLinkInNewTab and persists it to localStorage', () => {
      const service = createService();
      expect(service.settings.openLinkInNewTab).toBe(false);
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
      expect(store.openLinkInNewTab).toBe('true');
    });
  });

  describe('setTheme', () => {
    it('sets the theme and persists it', () => {
      const service = createService();
      service.setTheme('amoled');
      expect(service.settings.theme).toBe('amoled');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoled');
      expect(store.theme).toBe('amoled');
    });
  });

  describe('setFont', () => {
    it('sets the title font size and persists it', () => {
      const service = createService();
      service.setFont('20');
      expect(service.settings.titleFontSize).toBe('20');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
      expect(store.titleFontSize).toBe('20');
    });
  });

  describe('setSpacing', () => {
    it('sets the list spacing and persists it', () => {
      const service = createService();
      service.setSpacing('8');
      expect(service.settings.listSpacing).toBe('8');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '8');
      expect(store.listSpacing).toBe('8');
    });
  });

  describe('handleSystemPreferredColorSchemeChange', () => {
    it('sets the theme to "night" when the dark scheme matches', () => {
      const service = createService();
      service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('sets the theme to "default" when the dark scheme does not match', () => {
      const service = createService();
      service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('default');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
    });
  });
});
