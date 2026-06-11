import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockSettingsService: any;

  beforeEach(async(() => {
    mockSettingsService = {
      settings: {
        showSettings: true,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      },
      toggleSettings: jasmine.createSpy('toggleSettings'),
      toggleOpenLinksInNewTab: jasmine.createSpy('toggleOpenLinksInNewTab'),
      setTheme: jasmine.createSpy('setTheme'),
      setFont: jasmine.createSpy('setFont'),
      setSpacing: jasmine.createSpy('setSpacing')
    };

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set settings from SettingsService', () => {
    expect(component.settings).toBe(mockSettingsService.settings);
  });

  describe('closeSettings', () => {
    it('should call _settingsService.toggleSettings()', () => {
      component.closeSettings();
      expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
    });
  });

  describe('toggleOpenLinksInNewTab', () => {
    it('should call _settingsService.toggleOpenLinksInNewTab()', () => {
      component.toggleOpenLinksInNewTab();
      expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });
  });

  describe('selectTheme', () => {
    it('should call _settingsService.setTheme with the given theme', () => {
      component.selectTheme('night');
      expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
    });

    it('should call _settingsService.setTheme with amoledblack', () => {
      component.selectTheme('amoledblack');
      expect(mockSettingsService.setTheme).toHaveBeenCalledWith('amoledblack');
    });
  });

  describe('changeTitleFont', () => {
    it('should call _settingsService.setFont with the given value', () => {
      component.changeTitleFont('20');
      expect(mockSettingsService.setFont).toHaveBeenCalledWith('20');
    });
  });

  describe('changeSpacing', () => {
    it('should call _settingsService.setSpacing with the given value', () => {
      component.changeSpacing('10');
      expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('10');
    });
  });
});
