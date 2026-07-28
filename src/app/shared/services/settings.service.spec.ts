import { TestBed } from '@angular/core/testing';

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

    TestBed.configureTestingModule({ providers: [SettingsService] });
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribe to the system preferred color scheme', () => {
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('should remove the color scheme listener on destroy', () => {
    service.ngOnDestroy();
    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('should set and persist the theme', () => {
    service.setTheme('amoled');
    expect(service.settings.theme).toBe('amoled');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoled');
  });

  it('should set and persist the title font size', () => {
    service.setFont('20');
    expect(service.settings.titleFontSize).toBe('20');
    expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
  });

  it('should set and persist the list spacing', () => {
    service.setSpacing('8');
    expect(service.settings.listSpacing).toBe('8');
    expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '8');
  });

  it('should toggle the settings panel', () => {
    const initial = service.settings.showSettings;
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(!initial);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(initial);
  });

  it('should toggle and persist opening links in a new tab', () => {
    const initial = service.settings.openLinkInNewTab;
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(!initial);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', JSON.stringify(!initial));
  });

  it('should use the night theme when the system prefers a dark color scheme', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('night');
  });

  it('should use the default theme when the system does not prefer a dark color scheme', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('default');
  });
});
