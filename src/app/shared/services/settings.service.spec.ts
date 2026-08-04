import { SettingsService } from './settings.service';

interface MediaQueryListStub {
  matches: boolean;
  media: string;
  addEventListener: jasmine.Spy;
  removeEventListener: jasmine.Spy;
  dispatchEvent: jasmine.Spy;
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let mediaQueryList: MediaQueryListStub;

  function createMediaQueryListStub(matches: boolean): MediaQueryListStub {
    return {
      matches,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };
  }

  function createService(matches = false): SettingsService {
    mediaQueryList = createMediaQueryListStub(matches);
    (window.matchMedia as jasmine.Spy).and.returnValue(mediaQueryList as any);
    return new SettingsService();
  }

  beforeEach(() => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(window, 'matchMedia');
  });

  it('starts from sensible defaults when nothing is persisted', () => {
    const service = createService();

    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.theme).toBe('default');
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('hydrates settings from localStorage', () => {
    store = { openLinkInNewTab: 'true', titleFontSize: '20', listSpacing: '8', theme: 'amoledblack' };

    const service = createService();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('8');
    expect(service.settings.theme).toBe('amoledblack');
  });

  it('subscribes to the system preferred color scheme on construction', () => {
    const service = createService();

    expect(service.darkColorSchemeMedia).toBe(mediaQueryList as any);
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('asks the media query for the current scheme when no theme is persisted', () => {
    createService();

    expect(mediaQueryList.dispatchEvent).toHaveBeenCalled();
  });

  it('does not ask the media query for the current scheme when a theme is persisted', () => {
    store = { theme: 'night' };

    createService();

    expect(mediaQueryList.dispatchEvent).not.toHaveBeenCalled();
  });

  it('unsubscribes from the system preferred color scheme on destroy', () => {
    const service = createService();

    service.ngOnDestroy();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('toggles the settings panel', () => {
    const service = createService();

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggles opening links in a new tab and persists it', () => {
    const service = createService();

    service.toggleOpenLinksInNewTab();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

    service.toggleOpenLinksInNewTab();

    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
  });

  it('sets and persists the theme', () => {
    const service = createService();

    service.setTheme('amoledblack');

    expect(service.settings.theme).toBe('amoledblack');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoledblack');
  });

  it('sets and persists the title font size', () => {
    const service = createService();

    service.setFont('22');

    expect(service.settings.titleFontSize).toBe('22');
    expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
  });

  it('sets and persists the list spacing', () => {
    const service = createService();

    service.setSpacing('12');

    expect(service.settings.listSpacing).toBe('12');
    expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '12');
  });

  it('switches to the night theme when the system prefers dark', () => {
    const service = createService();

    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);

    expect(service.settings.theme).toBe('night');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
  });

  it('switches to the default theme when the system does not prefer dark', () => {
    const service = createService(true);

    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);

    expect(service.settings.theme).toBe('default');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
  });
});
