import { TestBed } from '@angular/core/testing';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let mediaQueryList: any;
  let matchMediaSpy: jasmine.Spy;

  function createService(): SettingsService {
    TestBed.configureTestingModule({ providers: [SettingsService] });
    return TestBed.inject(SettingsService);
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();

    mediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
      addListener: jasmine.createSpy('addListener'),
      removeListener: jasmine.createSpy('removeListener'),
      onchange: null
    };

    matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue(mediaQueryList);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    const service = createService();
    expect(service).toBeTruthy();
  });

  it('should initialize with default settings when localStorage is empty', () => {
    const service = createService();
    expect(service.settings.showSettings).toBe(false);
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(service.settings.theme).toBe('default');
    expect(service.settings.titleFontSize).toBe('16');
    expect(service.settings.listSpacing).toBe('0');
  });

  it('should read existing values from localStorage on init', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '5');
    localStorage.setItem('theme', 'night');

    const service = createService();

    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(service.settings.titleFontSize).toBe('20');
    expect(service.settings.listSpacing).toBe('5');
    expect(service.settings.theme).toBe('night');
  });

  it('should subscribe to the dark color scheme media query on construction', () => {
    const service = createService();
    expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    expect(service).toBeTruthy();
  });

  it('toggleSettings should flip showSettings from false to true and back', () => {
    const service = createService();
    expect(service.settings.showSettings).toBe(false);

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(true);

    service.toggleSettings();
    expect(service.settings.showSettings).toBe(false);
  });

  it('toggleOpenLinksInNewTab should flip the boolean and persist to localStorage', () => {
    const service = createService();
    expect(service.settings.openLinkInNewTab).toBe(false);

    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');

    service.toggleOpenLinksInNewTab();
    expect(service.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('setTheme should update settings.theme and persist to localStorage', () => {
    const service = createService();
    service.setTheme('night');
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');

    service.setTheme('amoledblack');
    expect(service.settings.theme).toBe('amoledblack');
    expect(localStorage.getItem('theme')).toBe('amoledblack');
  });

  it('setFont should update settings.titleFontSize and persist to localStorage', () => {
    const service = createService();
    service.setFont('22');
    expect(service.settings.titleFontSize).toBe('22');
    expect(localStorage.getItem('titleFontSize')).toBe('22');
  });

  it('setSpacing should update settings.listSpacing and persist to localStorage', () => {
    const service = createService();
    service.setSpacing('8');
    expect(service.settings.listSpacing).toBe('8');
    expect(localStorage.getItem('listSpacing')).toBe('8');
  });

  it('initTheme should use the saved theme from localStorage when present', () => {
    localStorage.setItem('theme', 'amoledblack');
    const service = createService();
    expect(service.settings.theme).toBe('amoledblack');
    expect(mediaQueryList.dispatchEvent).not.toHaveBeenCalled();
  });

  it('initTheme should dispatch the current media query event when no saved theme exists', () => {
    const service = createService();
    expect(mediaQueryList.dispatchEvent).toHaveBeenCalled();
    expect(service).toBeTruthy();
  });

  it('handleSystemPreferredColorSchemeChange should set theme to "night" when event.matches is true', () => {
    const service = createService();
    service.handleSystemPreferredColorSchemeChange({ matches: true } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('handleSystemPreferredColorSchemeChange should set theme to "default" when event.matches is false', () => {
    const service = createService();
    service.handleSystemPreferredColorSchemeChange({ matches: false } as MediaQueryListEvent);
    expect(service.settings.theme).toBe('default');
    expect(localStorage.getItem('theme')).toBe('default');
  });
});
