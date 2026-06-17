import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let localStorageStore: { [key: string]: string };
    let matchMediaResult: any;

    beforeEach(() => {
        localStorageStore = {};

        spyOn(localStorage, 'getItem').and.callFake((key: string) => {
            return localStorageStore[key] || null;
        });
        spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
            localStorageStore[key] = value;
        });

        matchMediaResult = {
            matches: false,
            media: '(prefers-color-scheme: dark)',
            addEventListener: jasmine.createSpy('addEventListener'),
            removeEventListener: jasmine.createSpy('removeEventListener'),
            dispatchEvent: jasmine.createSpy('dispatchEvent'),
        };
        spyOn(window, 'matchMedia').and.returnValue(matchMediaResult);

        service = new SettingsService();
    });

    it('should have default settings values', () => {
        expect(service.settings.showSettings).toBe(false);
        expect(service.settings.theme).toBe('default');
        expect(service.settings.titleFontSize).toBe('16');
        expect(service.settings.listSpacing).toBe('0');
    });

    it('toggleSettings should flip showSettings', () => {
        expect(service.settings.showSettings).toBe(false);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(true);
        service.toggleSettings();
        expect(service.settings.showSettings).toBe(false);
    });

    it('toggleOpenLinksInNewTab should flip the boolean and write to localStorage', () => {
        expect(service.settings.openLinkInNewTab).toBe(false);
        service.toggleOpenLinksInNewTab();
        expect(service.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith('openLinkInNewTab', 'true');
    });

    it('setTheme should update settings.theme and localStorage', () => {
        service.setTheme('night');
        expect(service.settings.theme).toBe('night');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'night');
    });

    it('setFont should update settings.titleFontSize and localStorage', () => {
        service.setFont('20');
        expect(service.settings.titleFontSize).toBe('20');
        expect(localStorage.setItem).toHaveBeenCalledWith('titleFontSize', '20');
    });

    it('setSpacing should update settings.listSpacing and localStorage', () => {
        service.setSpacing('5');
        expect(service.settings.listSpacing).toBe('5');
        expect(localStorage.setItem).toHaveBeenCalledWith('listSpacing', '5');
    });

    it('initTheme should read from localStorage if present', () => {
        localStorageStore['theme'] = 'amoled';
        service.initTheme();
        expect(service.settings.theme).toBe('amoled');
    });

    it('initTheme should dispatch media event if no saved theme', () => {
        service.initTheme();
        expect(matchMediaResult.dispatchEvent).toHaveBeenCalled();
    });

    it('handleSystemPreferredColorSchemeChange should set theme to night when matches is true', () => {
        const event = { matches: true } as MediaQueryListEvent;
        service.handleSystemPreferredColorSchemeChange(event);
        expect(service.settings.theme).toBe('night');
    });

    it('handleSystemPreferredColorSchemeChange should set theme to default when matches is false', () => {
        const event = { matches: false } as MediaQueryListEvent;
        service.handleSystemPreferredColorSchemeChange(event);
        expect(service.settings.theme).toBe('default');
    });
});
