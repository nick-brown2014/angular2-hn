import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let el: HTMLElement;
  let settings: Settings;
  let settingsService: jasmine.SpyObj<SettingsService>;

  function themeRadio(value: string): HTMLInputElement {
    return el.querySelector(`input[type="radio"][value="${value}"]`);
  }

  function numberInputs(): HTMLInputElement[] {
    return Array.from(el.querySelectorAll('input[type="number"]'));
  }

  function typeInto(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new KeyboardEvent('keyup'));
  }

  beforeEach(() => {
    settings = {
      showSettings: true,
      openLinkInNewTab: false,
      theme: 'night',
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
    });

    fixture = TestBed.createComponent(SettingsComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(el.querySelector('h1').textContent).toBe('Settings');
  });

  it('reflects the current settings in the form', () => {
    const checkbox: HTMLInputElement = el.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);

    expect(themeRadio('default').checked).toBe(false);
    expect(themeRadio('night').checked).toBe(true);
    expect(themeRadio('amoledblack').checked).toBe(false);

    const [fontSize, listSpacing] = numberInputs();
    expect(fontSize.value).toBe('16');
    expect(listSpacing.value).toBe('0');
  });

  it('checks the new tab checkbox when the setting is enabled', () => {
    settings.openLinkInNewTab = true;
    fixture.detectChanges();

    const checkbox: HTMLInputElement = el.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(true);
  });

  it('closes the settings panel', () => {
    (el.querySelector('.close') as HTMLElement).click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggles opening links in a new tab', () => {
    const checkbox: HTMLInputElement = el.querySelector('input[type="checkbox"]');
    checkbox.click();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);
  });

  it('selects a theme', () => {
    themeRadio('amoledblack').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');

    themeRadio('default').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('default');
  });

  it('changes the title font size', () => {
    typeInto(numberInputs()[0], '20');
    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('changes the list spacing', () => {
    typeInto(numberInputs()[1], '6');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('6');
  });
});
