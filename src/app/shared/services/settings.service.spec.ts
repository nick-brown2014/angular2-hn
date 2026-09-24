import { SettingsService } from './settings.service';

interface FakeMediaQueryList {
  media: string;
  matches: boolean;
  addEventListener: jasmine.Spy;
  removeEventListener: jasmine.Spy;
  dispatchEvent: jasmine.Spy;
}

describe('SettingsService', () => {
  let service: SettingsService;
  let mediaQuery: FakeMediaQueryList;
  let matchMediaSpy: jasmine.Spy;

  const createService = () => new SettingsService();

  beforeEach(() => {
    localStorage.clear();
    mediaQuery = {
      media: '(prefers-color-scheme: dark)',
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };
    matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue(mediaQuery as any);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('is created with default settings', () => {
    service = createService();
    expect(service).toBeTruthy();
    expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(service.settings).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    });
  });

  it('reads persisted openLinkInNewTab, titleFontSize and listSpacing from localStorage', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '12');
    service = createService();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('12');
  });

  it('subscribes to system color scheme changes on construction', () => {
    service = createService();
    expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('unsubscribes on destroy', () => {
    service = createService();
    const registeredListener = mediaQuery.addEventListener.calls.mostRecent().args[1];
    service.ngOnDestroy();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledTimes(1);
    expect(mediaQuery.removeEventListener.calls.mostRecent().args[1]).toBe(registeredListener);
  });

  describe('toggleSettings', () => {
    it('flips showSettings', () => {
      service = createService();
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
    });
  });

  describe('toggleOpenLinksInNewTab', () => {
    it('flips the flag and persists it', () => {
      service = createService();
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
    });
  });

  describe('setTheme', () => {
    it('updates the theme and persists it', () => {
      service = createService();
      service.setTheme('night');
      expect(service.settings.theme).toBe('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });
  });

  describe('setFont', () => {
    it('updates the title font size and persists it', () => {
      service = createService();
      service.setFont('22');
      expect(service.settings.titleFontSize).toBe('22');
      expect(localStorage.getItem('titleFontSize')).toBe('22');
    });
  });

  describe('setSpacing', () => {
    it('updates the list spacing and persists it', () => {
      service = createService();
      service.setSpacing('8');
      expect(service.settings.listSpacing).toBe('8');
      expect(localStorage.getItem('listSpacing')).toBe('8');
    });
  });

  describe('handleSystemPreferredColorSchemeChange', () => {
    it('sets the night theme when dark mode matches', () => {
      service = createService();
      service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('night');
      expect(localStorage.getItem('theme')).toBe('night');
    });

    it('sets the default theme when dark mode does not match', () => {
      service = createService();
      service.setTheme('night');
      service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
      expect(service.settings.theme).toBe('default');
      expect(localStorage.getItem('theme')).toBe('default');
    });
  });

  describe('initTheme', () => {
    it('applies a saved theme from localStorage without dispatching a media event', () => {
      localStorage.setItem('theme', 'night');
      service = createService();
      expect(service.settings.theme).toBe('night');
      expect(mediaQuery.dispatchEvent).not.toHaveBeenCalled();
    });

    it('dispatches a media-query change event when no theme is saved', () => {
      mediaQuery.matches = true;
      service = createService();
      expect(mediaQuery.dispatchEvent).toHaveBeenCalledTimes(1);
      const event: MediaQueryListEvent = mediaQuery.dispatchEvent.calls.mostRecent().args[0];
      expect(event.type).toBe('change');
      expect(event.matches).toBe(true);
      expect(event.media).toBe('(prefers-color-scheme: dark)');
    });
  });
});
