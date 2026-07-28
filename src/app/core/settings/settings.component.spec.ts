import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settingsService: any;

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
  });

  it('should expose the settings from the settings service', () => {
    expect(component.settings).toBe(settingsService.settings);
  });

  it('should close the settings panel through the settings service', () => {
    component.closeSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should toggle opening links in a new tab through the settings service', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('should select a theme through the settings service', () => {
    component.selectTheme('night');
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('should change the title font size through the settings service', () => {
    component.changeTitleFont('20');
    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('should change the list spacing through the settings service', () => {
    component.changeSpacing('8');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('8');
  });
});
