import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let store: { [key: string]: string };
  let mediaQueryList: any;

  beforeEach(() => {
    store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });

    mediaQueryList = {
      matches: false,
      media: '',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent').and.returnValue(true),
      onchange: null,
      addListener: () => {},
      removeListener: () => {}
    };

    spyOn(window, 'matchMedia').and.returnValue(mediaQueryList);

    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('has correct default settings when localStorage is empty', () => {
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.theme).toBe('default');
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('toggleSettings() flips showSettings between false and true', () => {
    expect(service.settings.showSettings).toBe(false);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);
    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab() flips the flag and persists to localStorage', () => {
    expect(service.settings.openLinkInNewTab).toBe(false);
    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');

    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
  });

  it('setTheme() updates settings.theme and writes to localStorage', () => {
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
  });

  it('setFont() updates settings.titleFontSize and writes to localStorage', () => {
    service.setFont('20');
    expect(service.settings.titleFontSize).toBe('20');
    expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
  });

  it('setSpacing() updates settings.listSpacing and writes to localStorage', () => {
    service.setSpacing('10');
    expect(service.settings.listSpacing).toBe('10');
    expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '10');
  });

  it('initTheme() reads the saved theme from localStorage when present', () => {
    store['theme'] = 'amoled';
    service.initTheme();
    expect(service.settings.theme).toBe('amoled');
  });

  it('initTheme() dispatches a change event on the media query when no saved theme exists', () => {
    mediaQueryList.dispatchEvent.calls.reset();
    service.initTheme();
    expect(mediaQueryList.dispatchEvent).toHaveBeenCalled();
  });

  it('subscribes to the system color scheme on construction', () => {
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  it('handleSystemPreferredColorSchemeChange sets night theme when matches=true', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('night');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
  });

  it('handleSystemPreferredColorSchemeChange sets default theme when matches=false', () => {
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('default');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'default');
  });

  it('ngOnDestroy unsubscribes from the system color scheme media query', () => {
    service.ngOnDestroy();
    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });

  describe('with pre-populated localStorage values', () => {
    it('reads saved openLinkInNewTab, titleFontSize, and listSpacing on construction', () => {
      store['openLinkInNewTab'] = 'true';
      store['titleFontSize'] = '22';
      store['listSpacing'] = '8';
      store['theme'] = 'amoled';

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const fresh = TestBed.inject(SettingsService);

      expect(fresh.settings.openLinkInNewTab).toBe(true);
      expect(fresh.settings.titleFontSize).toBe('22');
      expect(fresh.settings.listSpacing).toBe('8');
      expect(fresh.settings.theme).toBe('amoled');
    });
  });
});
