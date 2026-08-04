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
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component and exposes the shared settings', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsService.settings);
  });

  it('closes the panel through the settings service', () => {
    component.closeSettings();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('closes the panel when the close control is clicked', () => {
    const close: HTMLElement = fixture.nativeElement.querySelector('span.close');

    close.click();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('delegates the new tab preference', () => {
    component.toggleOpenLinksInNewTab();

    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('delegates the selected theme', () => {
    component.selectTheme('amoledblack');

    expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');
  });

  it('delegates the title font size', () => {
    component.changeTitleFont('22');

    expect(settingsService.setFont).toHaveBeenCalledWith('22');
  });

  it('delegates the list spacing', () => {
    component.changeSpacing('10');

    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });

  it('checks the radio matching the active theme', () => {
    const checked: HTMLInputElement = fixture.nativeElement.querySelector('input[type="radio"]:checked');

    expect(checked.value).toBe('default');
  });
});
