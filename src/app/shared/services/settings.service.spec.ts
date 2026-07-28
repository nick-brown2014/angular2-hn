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
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };
    spyOn(window, 'matchMedia').and.returnValue(mediaQueryList);

    service = new SettingsService();
  });

  it('should be created and subscribe to the system color scheme', () => {
    expect(service).toBeTruthy();
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('should persist the theme', () => {
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    expect(store.theme).toBe('night');
  });

  it('should persist the title font size', () => {
    service.setFont('20');
    expect(service.settings.titleFontSize).toBe('20');
    expect(store.titleFontSize).toBe('20');
  });

  it('should persist the list spacing', () => {
    service.setSpacing('8');
    expect(service.settings.listSpacing).toBe('8');
    expect(store.listSpacing).toBe('8');
  });

  it('should toggle and persist opening links in a new tab', () => {
    const initial = service.settings.openLinkInNewTab;
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(!initial);
    expect(store.openLinkInNewTab).toBe(JSON.stringify(!initial));
  });

  it('should toggle the settings panel', () => {
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('should dispatch a change event when no theme is saved', () => {
    expect(mediaQueryList.dispatchEvent).toHaveBeenCalled();
  });

  it('should read a saved theme from localStorage', () => {
    store.theme = 'black';
    service.initTheme();
    expect(service.settings.theme).toBe('black');
  });

  it('should use the night theme when the system prefers dark', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('night');
  });

  it('should use the default theme when the system does not prefer dark', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('default');
  });

  it('should unsubscribe from the system color scheme on destroy', () => {
    service.ngOnDestroy();
    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });
});
