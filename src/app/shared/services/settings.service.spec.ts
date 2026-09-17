import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let store: { [key: string]: string };
  let mediaQueryList: any;

  beforeEach(() => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });

    mediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
    };
    spyOn(window, 'matchMedia').and.returnValue(mediaQueryList);

    service = new SettingsService();
  });

  it('subscribes to system color scheme changes on construction', () => {
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('initTheme dispatches a change event when no theme is saved', () => {
    expect(mediaQueryList.dispatchEvent).toHaveBeenCalledTimes(1);
    expect(service.settings.theme).toBe('default');
  });

  it('setTheme updates settings and persists to localStorage', () => {
    service.setTheme('amoled');
    expect(service.settings.theme).toBe('amoled');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoled');
  });

  it('setFont updates settings and persists to localStorage', () => {
    service.setFont('18');
    expect(service.settings.titleFontSize).toBe('18');
    expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '18');
  });

  it('setSpacing updates settings and persists to localStorage', () => {
    service.setSpacing('2');
    expect(service.settings.listSpacing).toBe('2');
    expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '2');
  });

  it('toggleSettings flips showSettings', () => {
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab flips the flag and persists it', () => {
    expect(service.settings.openLinkInNewTab).toBe(false);
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
  });

  it('handleSystemPreferredColorSchemeChange sets night theme when matches is true', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('night');
  });

  it('handleSystemPreferredColorSchemeChange sets default theme when matches is false', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('default');
  });

  it('initTheme uses saved theme from localStorage when present', () => {
    store.theme = 'night';
    mediaQueryList.dispatchEvent.calls.reset();
    const svc = new SettingsService();
    expect(svc.settings.theme).toBe('night');
    expect(mediaQueryList.dispatchEvent).not.toHaveBeenCalled();
  });
});
