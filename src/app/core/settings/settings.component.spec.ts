import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService> & { settings: Settings };

  beforeEach(async () => {
    const baseSettings: Settings = {
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    settingsServiceSpy = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]) as jasmine.SpyObj<SettingsService> & { settings: Settings };
    settingsServiceSpy.settings = baseSettings;

    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('closeSettings should call settingsService.toggleSettings', () => {
    component.closeSettings();
    expect(settingsServiceSpy.toggleSettings).toHaveBeenCalled();
  });

  it('toggleOpenLinksInNewTab should call settingsService.toggleOpenLinksInNewTab', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsServiceSpy.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('selectTheme should call settingsService.setTheme with the chosen theme', () => {
    component.selectTheme('night');
    expect(settingsServiceSpy.setTheme).toHaveBeenCalledWith('night');
  });

  it('changeTitleFont should call settingsService.setFont with the given size', () => {
    component.changeTitleFont('20');
    expect(settingsServiceSpy.setFont).toHaveBeenCalledWith('20');
  });

  it('changeSpacing should call settingsService.setSpacing with the given value', () => {
    component.changeSpacing('5');
    expect(settingsServiceSpy.setSpacing).toHaveBeenCalledWith('5');
  });
});
