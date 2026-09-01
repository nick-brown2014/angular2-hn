import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settings: Settings;
  let settingsService: {
    settings: Settings;
    toggleSettings: jasmine.Spy;
    toggleOpenLinksInNewTab: jasmine.Spy;
    setTheme: jasmine.Spy;
    setFont: jasmine.Spy;
    setSpacing: jasmine.Spy;
  };

  beforeEach(() => {
    settings = {
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };
    settingsService = {
      settings,
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
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('creates and reads the settings from the service', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('closeSettings toggles the settings panel', () => {
    component.closeSettings();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggleOpenLinksInNewTab delegates to the service', () => {
    component.toggleOpenLinksInNewTab();

    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('selectTheme passes the chosen theme to the service', () => {
    component.selectTheme('night');

    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('changeTitleFont passes the chosen font size to the service', () => {
    component.changeTitleFont('20');

    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('changeSpacing passes the chosen spacing to the service', () => {
    component.changeSpacing('8');

    expect(settingsService.setSpacing).toHaveBeenCalledWith('8');
  });
});
