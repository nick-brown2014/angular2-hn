import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
    let mockSettingsService: any;

    beforeEach(async(() => {
        mockSettingsService = {
            settings: {
                showSettings: false,
                openLinkInNewTab: false,
                theme: 'default',
                titleFontSize: '16',
                listSpacing: '0',
            },
            toggleSettings: jasmine.createSpy('toggleSettings'),
            toggleOpenLinksInNewTab: jasmine.createSpy('toggleOpenLinksInNewTab'),
            setTheme: jasmine.createSpy('setTheme'),
            setFont: jasmine.createSpy('setFont'),
            setSpacing: jasmine.createSpy('setSpacing'),
        };

        TestBed.configureTestingModule({
            declarations: [SettingsComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));

    it('should create and assign settings from service', () => {
        const fixture = TestBed.createComponent(SettingsComponent);
        expect(fixture.componentInstance).toBeTruthy();
        expect(fixture.componentInstance.settings).toBe(mockSettingsService.settings);
    });

    it('closeSettings should call _settingsService.toggleSettings', () => {
        const fixture = TestBed.createComponent(SettingsComponent);
        fixture.componentInstance.closeSettings();
        expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });

    it('toggleOpenLinksInNewTab should call _settingsService.toggleOpenLinksInNewTab', () => {
        const fixture = TestBed.createComponent(SettingsComponent);
        fixture.componentInstance.toggleOpenLinksInNewTab();
        expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('selectTheme should call _settingsService.setTheme', () => {
        const fixture = TestBed.createComponent(SettingsComponent);
        fixture.componentInstance.selectTheme('night');
        expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
    });

    it('changeTitleFont should call _settingsService.setFont', () => {
        const fixture = TestBed.createComponent(SettingsComponent);
        fixture.componentInstance.changeTitleFont('20');
        expect(mockSettingsService.setFont).toHaveBeenCalledWith('20');
    });

    it('changeSpacing should call _settingsService.setSpacing', () => {
        const fixture = TestBed.createComponent(SettingsComponent);
        fixture.componentInstance.changeSpacing('5');
        expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('5');
    });
});
