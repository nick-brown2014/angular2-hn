import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settingsService: {
    settings: Settings;
    toggleSettings: jasmine.Spy;
    toggleOpenLinksInNewTab: jasmine.Spy;
    setTheme: jasmine.Spy;
    setFont: jasmine.Spy;
    setSpacing: jasmine.Spy;
  };

  beforeEach(() => {
    settingsService = {
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
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsService.settings);
  });

  it('should delegate every control to the settings service', () => {
    component.closeSettings();
    component.toggleOpenLinksInNewTab();
    component.selectTheme('night');
    component.changeTitleFont('18');
    component.changeSpacing('2');

    expect(settingsService.toggleSettings).toHaveBeenCalled();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
    expect(settingsService.setFont).toHaveBeenCalledWith('18');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('2');
  });
});
