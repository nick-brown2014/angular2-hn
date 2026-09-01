import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let settings: Settings;

  beforeEach(async(() => {
    settings = {
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing',
    ]);
    settingsService.settings = settings;

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('closeSettings() delegates to toggleSettings', () => {
    component.closeSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('toggleOpenLinksInNewTab() delegates to the service', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);
  });

  it('selectTheme() delegates to setTheme', () => {
    component.selectTheme('night');
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('changeTitleFont() delegates to setFont', () => {
    component.changeTitleFont('20');
    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('changeSpacing() delegates to setSpacing', () => {
    component.changeSpacing('4');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('4');
  });

  it('checks the radio matching the current theme', () => {
    const night: HTMLInputElement = fixture.nativeElement.querySelector('input[value="night"]');
    const def: HTMLInputElement = fixture.nativeElement.querySelector('input[value="default"]');
    expect(def.checked).toBe(true);
    expect(night.checked).toBe(false);
  });
});
