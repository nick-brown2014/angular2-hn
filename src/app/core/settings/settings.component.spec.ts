import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(async(() => {
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]);
    (settingsService as any).settings = { showSettings: false, theme: 'default' };

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  }));

  it('should create and expose the service settings', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe((settingsService as any).settings);
  });

  it('should close the settings panel', () => {
    component.closeSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should toggle opening links in a new tab', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('should select a theme', () => {
    component.selectTheme('night');
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('should change the title font size', () => {
    component.changeTitleFont('20');
    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('should change the list spacing', () => {
    component.changeSpacing('8');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('8');
  });
});
