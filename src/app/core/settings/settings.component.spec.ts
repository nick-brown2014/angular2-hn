import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let mockSettingsService: any;

  beforeEach(async(() => {
    mockSettingsService = {
      settings: {
        showSettings: false,
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
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closeSettings() should call settingsService.toggleSettings()', () => {
    component.closeSettings();
    expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggleOpenLinksInNewTab() should call settingsService.toggleOpenLinksInNewTab()', () => {
    component.toggleOpenLinksInNewTab();
    expect(mockSettingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('selectTheme("night") should call settingsService.setTheme("night")', () => {
    component.selectTheme('night');
    expect(mockSettingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('changeTitleFont("18") should call settingsService.setFont("18")', () => {
    component.changeTitleFont('18');
    expect(mockSettingsService.setFont).toHaveBeenCalledWith('18');
  });

  it('changeSpacing("5") should call settingsService.setSpacing("5")', () => {
    component.changeSpacing('5');
    expect(mockSettingsService.setSpacing).toHaveBeenCalledWith('5');
  });
});
