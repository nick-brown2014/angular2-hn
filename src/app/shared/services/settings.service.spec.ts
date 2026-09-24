import { SettingsService } from './settings.service';

class MatchMediaStub {
  media = '(prefers-color-scheme: dark)';
  matches = false;
  private listeners: Array<(event: MediaQueryListEvent) => void> = [];

  addEventListener = jasmine
    .createSpy('addEventListener')
    .and.callFake((type: string, listener: (event: MediaQueryListEvent) => void) => {
      this.listeners.push(listener);
    });

  removeEventListener = jasmine.createSpy('removeEventListener');

  dispatchEvent = jasmine.createSpy('dispatchEvent').and.callFake((event: MediaQueryListEvent) => {
    this.listeners.forEach(listener => listener(event));
    return true;
  });
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let mediaStub: MatchMediaStub;

  const createService = () => new SettingsService();

  beforeEach(() => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key in store ? store[key] : null
    );
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });

    mediaStub = new MatchMediaStub();
    spyOn(window, 'matchMedia').and.returnValue(mediaStub as any);
  });

  describe('initialisation', () => {
    it('uses defaults when localStorage is empty', () => {
      const service = createService();

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(service.settings.showSettings).toBe(false);
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(service.settings.titleFontSize).toBe('16');
      expect(service.settings.listSpacing).toBe('0');
    });

    it('restores persisted values from localStorage', () => {
      store.openLinkInNewTab = 'true';
      store.titleFontSize = '20';
      store.listSpacing = '12';
      store.theme = 'sepia';

      const service = createService();

      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(service.settings.titleFontSize).toBe('20');
      expect(service.settings.listSpacing).toBe('12');
      expect(service.settings.theme).toBe('sepia');
      expect(mediaStub.dispatchEvent).not.toHaveBeenCalled();
    });

    it('subscribes to system colour scheme changes', () => {
      createService();
      expect(mediaStub.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });

    it('falls back to the system preference when no theme is saved (light)', () => {
      mediaStub.matches = false;
      const service = createService();

      expect(mediaStub.dispatchEvent).toHaveBeenCalled();
      expect(service.settings.theme).toBe('default');
    });

    it('falls back to the system preference when no theme is saved (dark)', () => {
      mediaStub.matches = true;
      const service = createService();

      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('unsubscribes on destroy', () => {
      const service = createService();
      service.ngOnDestroy();
      expect(mediaStub.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('handleSystemPreferredColorSchemeChange', () => {
    it('switches to night theme when dark mode matches', () => {
      const service = createService();
      service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('switches to default theme when dark mode does not match', () => {
      const service = createService();
      service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('default');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
    });
  });

  describe('toggleSettings', () => {
    it('flips the showSettings flag', () => {
      const service = createService();
      expect(service.settings.showSettings).toBe(false);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
    });
  });

  describe('toggleOpenLinksInNewTab', () => {
    it('flips the flag and persists it', () => {
      const service = createService();
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
    });
  });

  describe('setTheme', () => {
    it('updates and persists the theme', () => {
      const service = createService();
      service.setTheme('sepia');
      expect(service.settings.theme).toBe('sepia');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'sepia');
    });
  });

  describe('setFont', () => {
    it('updates and persists the title font size', () => {
      const service = createService();
      service.setFont('22');
      expect(service.settings.titleFontSize).toBe('22');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
    });
  });

  describe('setSpacing', () => {
    it('updates and persists the list spacing', () => {
      const service = createService();
      service.setSpacing('8');
      expect(service.settings.listSpacing).toBe('8');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '8');
    });
  });
});
