import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockMatchMedia: any;

  beforeEach(() => {
    localStorage.clear();

    mockMatchMedia = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };

    spyOn(window, 'matchMedia').and.returnValue(mockMatchMedia);

    service = new SettingsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default settings when localStorage is empty', () => {
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.theme).toBe('default');
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('toggleSettings() should flip showSettings', () => {
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab() should flip the boolean and persist to localStorage', () => {
    expect(service.settings.openLinkInNewTab).toBe(false);
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('setTheme() should update settings.theme and persist to localStorage', () => {
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('setFont() should update settings.titleFontSize and persist to localStorage', () => {
    service.setFont('20');
    expect(service.settings.titleFontSize).toBe('20');
    expect(localStorage.getItem('titleFontSize')).toBe('20');
  });

  it('setSpacing() should update settings.listSpacing and persist to localStorage', () => {
    service.setSpacing('5');
    expect(service.settings.listSpacing).toBe('5');
    expect(localStorage.getItem('listSpacing')).toBe('5');
  });

  it('initTheme() should read from localStorage if a saved theme exists', () => {
    localStorage.setItem('theme', 'night');
    service.initTheme();
    expect(service.settings.theme).toBe('night');
  });

  it('initTheme() should dispatch change event when no saved theme', () => {
    service.initTheme();
    expect(mockMatchMedia.dispatchEvent).toHaveBeenCalled();
  });

  it('handleSystemPreferredColorSchemeChange should set "night" when matches=true', () => {
    const event = { matches: true } as MediaQueryListEvent;
    service.handleSystemPreferredColorSchemeChange(event);
    expect(service.settings.theme).toBe('night');
  });

  it('handleSystemPreferredColorSchemeChange should set "default" when matches=false', () => {
    service.settings.theme = 'night';
    const event = { matches: false } as MediaQueryListEvent;
    service.handleSystemPreferredColorSchemeChange(event);
    expect(service.settings.theme).toBe('default');
  });
});
