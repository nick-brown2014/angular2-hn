import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let mediaQueryList: any;
  let store: { [key: string]: string };
  let nativeMatchMedia: any;

  beforeEach(() => {
    store = {};
    mediaQueryList = {
      media: '(prefers-color-scheme: dark)',
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };
    nativeMatchMedia = window.matchMedia;
    (window as any).matchMedia = jasmine.createSpy('matchMedia').and.returnValue(mediaQueryList);

    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      store[key] !== undefined ? store[key] : null
    );
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });

    service = new SettingsService();
  });

  afterEach(() => {
    (window as any).matchMedia = nativeMatchMedia;
  });

  it('is created and subscribes to the system color scheme', () => {
    expect(service).toBeTruthy();
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('defaults settings when nothing is persisted', () => {
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('toggleSettings flips the settings panel without persisting', () => {
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('toggleOpenLinksInNewTab flips the flag and persists it', () => {
    service.toggleOpenLinksInNewTab();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

    service.toggleOpenLinksInNewTab();

    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
  });

  it('setTheme stores the theme', () => {
    service.setTheme('amoledblack');

    expect(service.settings.theme).toBe('amoledblack');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoledblack');
  });

  it('setFont stores the title font size', () => {
    service.setFont('22');

    expect(service.settings.titleFontSize).toBe('22');
    expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
  });

  it('setSpacing stores the list spacing', () => {
    service.setSpacing('8');

    expect(service.settings.listSpacing).toBe('8');
    expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '8');
  });

  it('handleSystemPreferredColorSchemeChange selects the night theme when dark is preferred', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);

    expect(service.settings.theme).toBe('night');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
  });

  it('handleSystemPreferredColorSchemeChange selects the default theme otherwise', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);

    expect(service.settings.theme).toBe('default');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
  });

  it('restores a persisted theme instead of asking the system', () => {
    store.theme = 'night';
    mediaQueryList.dispatchEvent.calls.reset();

    const restored = new SettingsService();

    expect(restored.settings.theme).toBe('night');
    expect(mediaQueryList.dispatchEvent).not.toHaveBeenCalled();
  });

  it('asks the system for a theme when none is persisted', () => {
    expect(mediaQueryList.dispatchEvent).toHaveBeenCalled();
  });

  it('unsubscribes from the media query on destroy', () => {
    service.ngOnDestroy();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });
});
