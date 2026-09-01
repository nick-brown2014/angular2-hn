import { SettingsService } from './settings.service';

class FakeMediaQueryList {
  media = '(prefers-color-scheme: dark)';
  matches: boolean;
  private listeners: Array<(event: MediaQueryListEvent) => void> = [];

  constructor(matches: boolean) {
    this.matches = matches;
  }

  addEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
    this.listeners.push(listener);
  }

  removeEventListener(type: string, listener: (event: MediaQueryListEvent) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  dispatchEvent(event: MediaQueryListEvent) {
    this.listeners.forEach(l => l(event));
    return true;
  }
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let mediaQueryList: FakeMediaQueryList;

  function createService(prefersDark = false): SettingsService {
    mediaQueryList = new FakeMediaQueryList(prefersDark);
    spyOn(window, 'matchMedia').and.returnValue(mediaQueryList as any);
    return new SettingsService();
  }

  beforeEach(() => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
  });

  it('should create', () => {
    expect(createService()).toBeTruthy();
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  describe('initialization', () => {
    it('uses defaults when nothing is stored', () => {
      const service = createService();
      expect(service.settings.showSettings).toBe(false);
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(service.settings.titleFontSize).toBe('16');
      expect(service.settings.listSpacing).toBe('0');
    });

    it('restores persisted settings from localStorage', () => {
      store.openLinkInNewTab = 'true';
      store.titleFontSize = '20';
      store.listSpacing = '8';
      store.theme = 'amoledblack';

      const service = createService(true);
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('8');
      expect(service.settings.theme).toBe('amoledblack');
    });

    it('subscribes to system color scheme changes', () => {
      mediaQueryList = new FakeMediaQueryList(false);
      spyOn(mediaQueryList, 'addEventListener').and.callThrough();
      spyOn(window, 'matchMedia').and.returnValue(mediaQueryList as any);

      const service = new SettingsService();

      expect(service).toBeTruthy();
      expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });

    it('falls back to the system preferred theme when no theme is saved (dark)', () => {
      const service = createService(true);
      expect(service.settings.theme).toBe('night');
    });

    it('falls back to the system preferred theme when no theme is saved (light)', () => {
      const service = createService(false);
      expect(service.settings.theme).toBe('default');
    });
  });

  describe('setTheme', () => {
    it('updates settings and persists to localStorage', () => {
      const service = createService();
      service.setTheme('night');
      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });
  });

  describe('setFont', () => {
    it('updates settings and persists to localStorage', () => {
      const service = createService();
      service.setFont('18');
      expect(service.settings.titleFontSize).toBe('18');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '18');
    });
  });

  describe('setSpacing', () => {
    it('updates settings and persists to localStorage', () => {
      const service = createService();
      service.setSpacing('12');
      expect(service.settings.listSpacing).toBe('12');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '12');
    });
  });

  describe('toggleOpenLinksInNewTab', () => {
    it('flips the flag and persists it as JSON', () => {
      const service = createService();
      expect(service.settings.openLinkInNewTab).toBe(false);

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
    });
  });

  describe('toggleSettings', () => {
    it('flips showSettings without touching localStorage', () => {
      const service = createService();
      (localStorage.setItem as jasmine.Spy).calls.reset();

      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('handleSystemPreferredColorSchemeChange', () => {
    it('sets theme to "night" when the event matches', () => {
      const service = createService();
      service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('sets theme to "default" when the event does not match', () => {
      const service = createService(true);
      service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('default');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
    });

    it('reacts to change events dispatched by the media query list', () => {
      const service = createService(false);
      mediaQueryList.dispatchEvent({ matches: true } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('night');
    });
  });

  describe('ngOnDestroy', () => {
    it('removes the change listener', () => {
      const service = createService();
      spyOn(mediaQueryList, 'removeEventListener').and.callThrough();
      service.ngOnDestroy();
      expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });
});
