import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let mediaMock: any;

  function createService(): SettingsService {
    return new SettingsService();
  }

  beforeEach(() => {
    store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });

    mediaMock = {
      media: '(prefers-color-scheme: dark)',
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };

    spyOn(window, 'matchMedia').and.returnValue(mediaMock);
  });

  it('creates with default settings', () => {
    const service = createService();

    expect(service).toBeTruthy();
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.theme).toBe('default');
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('reads persisted settings from localStorage', () => {
    store.openLinkInNewTab = 'true';
    store.titleFontSize = '20';
    store.listSpacing = '8';

    const service = createService();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('8');
  });

  it('subscribes to the system preferred color scheme on construction', () => {
    createService();

    expect(mediaMock.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('unsubscribes from the system preferred color scheme on destroy', () => {
    const service = createService();

    service.ngOnDestroy();

    expect(mediaMock.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('toggleSettings flips showSettings', () => {
    const service = createService();

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab flips the flag and persists it', () => {
    const service = createService();

    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
  });

  it('setTheme updates and persists the theme', () => {
    const service = createService();

    service.setTheme('night');

    expect(service.settings.theme).toBe('night');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
  });

  it('setFont updates and persists the title font size', () => {
    const service = createService();

    service.setFont('22');

    expect(service.settings.titleFontSize).toBe('22');
    expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '22');
  });

  it('setSpacing updates and persists the list spacing', () => {
    const service = createService();

    service.setSpacing('12');

    expect(service.settings.listSpacing).toBe('12');
    expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '12');
  });

  it('handleSystemPreferredColorSchemeChange selects the night theme when dark is preferred', () => {
    const service = createService();

    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);

    expect(service.settings.theme).toBe('night');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
  });

  it('handleSystemPreferredColorSchemeChange selects the default theme otherwise', () => {
    const service = createService();
    service.settings.theme = 'night';

    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);

    expect(service.settings.theme).toBe('default');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
  });

  it('initTheme uses the saved theme when one is persisted', () => {
    store.theme = 'amoled';

    const service = createService();

    expect(service.settings.theme).toBe('amoled');
    expect(mediaMock.dispatchEvent).not.toHaveBeenCalled();
  });

  it('initTheme falls back to the system preference when no theme is persisted', () => {
    createService();

    expect(mediaMock.dispatchEvent).toHaveBeenCalled();
  });
});
