import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing',
    ]);
    (settingsService as any).settings = {
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and expose settings from the service', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsService.settings);
  });

  it('closeSettings delegates to toggleSettings', () => {
    component.closeSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('toggleOpenLinksInNewTab delegates to the service', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);
  });

  it('selectTheme delegates to setTheme', () => {
    component.selectTheme('night');
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('changeTitleFont delegates to setFont', () => {
    component.changeTitleFont('20');
    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('changeSpacing delegates to setSpacing', () => {
    component.changeSpacing('4');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('4');
  });
});
