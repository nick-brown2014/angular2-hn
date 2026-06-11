import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let store: { [key: string]: string };
  let mockMediaQueryList: any;

  beforeEach(() => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => store[key] = value);

    mockMediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      dispatchEvent: jasmine.createSpy('dispatchEvent')
    };
    spyOn(window, 'matchMedia').and.returnValue(mockMediaQueryList);

    service = new SettingsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial settings defaults when localStorage is empty', () => {
    it('should have showSettings as false', () => {
      expect(service.settings.showSettings).toBe(false);
    });

    it('should have openLinkInNewTab as false', () => {
      expect(service.settings.openLinkInNewTab).toBe(false);
    });

    it('should have default titleFontSize of 16', () => {
      expect(service.settings.titleFontSize).toBe('16');
    });

    it('should have default listSpacing of 0', () => {
      expect(service.settings.listSpacing).toBe('0');
    });
  });

  describe('initial settings when localStorage has values', () => {
    it('should read openLinkInNewTab from localStorage', () => {
      store['openLinkInNewTab'] = 'true';
      const svc = new SettingsService();
      expect(svc.settings.openLinkInNewTab).toBe(true);
    });

    it('should read titleFontSize from localStorage', () => {
      store['titleFontSize'] = '20';
      const svc = new SettingsService();
      expect(svc.settings.titleFontSize).toBe('20');
    });

    it('should read listSpacing from localStorage', () => {
      store['listSpacing'] = '10';
      const svc = new SettingsService();
      expect(svc.settings.listSpacing).toBe('10');
    });
  });

  describe('toggleSettings', () => {
    it('should flip showSettings from false to true', () => {
      expect(service.settings.showSettings).toBe(false);
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(true);
    });

    it('should flip showSettings from true to false', () => {
      service.settings.showSettings = true;
      service.toggleSettings();
      expect(service.settings.showSettings).toBe(false);
    });
  });

  describe('toggleOpenLinksInNewTab', () => {
    it('should flip openLinkInNewTab and persist to localStorage', () => {
      expect(service.settings.openLinkInNewTab).toBe(false);
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
    });

    it('should toggle back and persist false', () => {
      service.settings.openLinkInNewTab = true;
      service.toggleOpenLinksInNewTab();
      expect(service.settings.openLinkInNewTab).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'false');
    });
  });

  describe('setTheme', () => {
    it('should update settings theme and persist to localStorage', () => {
      service.setTheme('night');
      expect(service.settings.theme).toBe('night');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('should update to amoledblack theme', () => {
      service.setTheme('amoledblack');
      expect(service.settings.theme).toBe('amoledblack');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'amoledblack');
    });
  });

  describe('setFont', () => {
    it('should update titleFontSize and persist to localStorage', () => {
      service.setFont('20');
      expect(service.settings.titleFontSize).toBe('20');
      expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
    });
  });

  describe('setSpacing', () => {
    it('should update listSpacing and persist to localStorage', () => {
      service.setSpacing('15');
      expect(service.settings.listSpacing).toBe('15');
      expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '15');
    });
  });

  describe('initTheme', () => {
    it('should read theme from localStorage if saved', () => {
      store['theme'] = 'amoledblack';
      const svc = new SettingsService();
      expect(svc.settings.theme).toBe('amoledblack');
    });

    it('should dispatch change event on darkColorSchemeMedia when no saved theme', () => {
      // no theme in store; service was already constructed in beforeEach
      expect(mockMediaQueryList.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe('handleSystemPreferredColorSchemeChange', () => {
    it('should set theme to night when matches is true', () => {
      const event = { matches: true } as MediaQueryListEvent;
      service.handleSystemPreferredColorSchemeChange(event);
      expect(service.settings.theme).toBe('night');
    });

    it('should set theme to default when matches is false', () => {
      service.settings.theme = 'night';
      const event = { matches: false } as MediaQueryListEvent;
      service.handleSystemPreferredColorSchemeChange(event);
      expect(service.settings.theme).toBe('default');
    });
  });

  describe('subscribeToSystemPreferredColorScheme', () => {
    it('should add event listener on darkColorSchemeMedia', () => {
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove event listener on darkColorSchemeMedia', () => {
      service.ngOnDestroy();
      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });
  });
});
