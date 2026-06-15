import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
    } as any);
    service = new SettingsService();
  });

  it('should have correct default settings', () => {
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.theme).toBe('default');
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('toggleSettings() should flip showSettings boolean', () => {
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab() should flip openLinkInNewTab and persist to localStorage', () => {
    expect(service.settings.openLinkInNewTab).toBe(false);
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
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

  it('initTheme() should read theme from localStorage if present', () => {
    localStorage.setItem('theme', 'amoled');
    service.initTheme();
    expect(service.settings.theme).toBe('amoled');
  });
});
