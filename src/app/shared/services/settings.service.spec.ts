import { SettingsService } from './settings.service';

class FakeMediaQueryList {
  matches = false;
  media = '(prefers-color-scheme: dark)';
  listeners: Array<(e: any) => void> = [];

  addEventListener(type: string, cb: (e: any) => void) {
    this.listeners.push(cb);
  }

  removeEventListener(type: string, cb: (e: any) => void) {
    this.listeners = this.listeners.filter(l => l !== cb);
  }

  dispatchEvent(event: any) {
    this.listeners.forEach(l => l(event));
    return true;
  }
}

describe('SettingsService', () => {
  let store: { [key: string]: string };
  let media: FakeMediaQueryList;

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
    media = new FakeMediaQueryList();
    spyOn(window, 'matchMedia').and.returnValue(media as any);
  });

  it('should be created and subscribe to the color-scheme media query', () => {
    spyOn(media, 'addEventListener').and.callThrough();
    const service = createService();
    expect(service).toBeTruthy();
    expect(media.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('setTheme should update settings and persist to localStorage', () => {
    const service = createService();
    service.setTheme('amoled');
    expect(service.settings.theme).toBe('amoled');
    expect(store.theme).toBe('amoled');
  });

  it('setFont should update titleFontSize and persist to localStorage', () => {
    const service = createService();
    service.setFont('20');
    expect(service.settings.titleFontSize).toBe('20');
    expect(store.titleFontSize).toBe('20');
  });

  it('setSpacing should update listSpacing and persist to localStorage', () => {
    const service = createService();
    service.setSpacing('8');
    expect(service.settings.listSpacing).toBe('8');
    expect(store.listSpacing).toBe('8');
  });

  it('toggleSettings should flip showSettings', () => {
    const service = createService();
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab should flip the flag and persist it', () => {
    const service = createService();
    expect(service.settings.openLinkInNewTab).toBe(false);
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(store.openLinkInNewTab).toBe('true');
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(store.openLinkInNewTab).toBe('false');
  });

  it('initTheme should use a saved theme and not dispatch a media-query change', () => {
    store.theme = 'night';
    spyOn(media, 'dispatchEvent').and.callThrough();
    const service = createService();
    expect(service.settings.theme).toBe('night');
    expect(media.dispatchEvent).not.toHaveBeenCalled();
  });

  it('initTheme should dispatch a media-query change when no theme is saved', () => {
    media.matches = true;
    spyOn(media, 'dispatchEvent').and.callThrough();
    const service = createService();
    expect(media.dispatchEvent).toHaveBeenCalled();
    // The dispatched change (matches === true) maps to the 'night' theme.
    expect(service.settings.theme).toBe('night');
  });

  it('handleSystemPreferredColorSchemeChange should map matches to night/default', () => {
    const service = createService();
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('night');
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('default');
  });
});
