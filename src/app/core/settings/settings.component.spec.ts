import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settings: Settings;
  let settingsService: jasmine.SpyObj<SettingsService>;

  const radio = (value: string): HTMLInputElement =>
    fixture.nativeElement.querySelector(`input[type="radio"][value="${value}"]`);

  beforeEach(() => {
    settings = { showSettings: true, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]);
    settingsService.settings = settings;

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('closes the panel via SettingsService.toggleSettings', () => {
    const close: HTMLElement = fixture.nativeElement.querySelector('.close');
    close.click();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('reflects and toggles the open-links-in-new-tab checkbox', () => {
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);

    checkbox.click();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);

    settings.openLinkInNewTab = true;
    fixture.detectChanges();
    expect(checkbox.checked).toBe(true);
  });

  it('checks the radio matching the current theme', () => {
    expect(radio('default').checked).toBe(true);
    expect(radio('night').checked).toBe(false);
    expect(radio('amoledblack').checked).toBe(false);

    settings.theme = 'amoledblack';
    fixture.detectChanges();
    expect(radio('default').checked).toBe(false);
    expect(radio('amoledblack').checked).toBe(true);
  });

  it('selects a theme through SettingsService.setTheme', () => {
    radio('night').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('night');

    radio('amoledblack').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');
  });

  it('shows the current font size and spacing values', () => {
    settings.titleFontSize = '22';
    settings.listSpacing = '9';
    fixture.detectChanges();

    const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input[type="number"]');
    expect(inputs[0].value).toBe('22');
    expect(inputs[1].value).toBe('9');
  });

  it('updates the title font size on keyup', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelectorAll('input[type="number"]')[0];
    input.value = '18';
    input.dispatchEvent(new Event('keyup'));
    expect(settingsService.setFont).toHaveBeenCalledWith('18');
  });

  it('updates the list spacing on keyup', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelectorAll('input[type="number"]')[1];
    input.value = '6';
    input.dispatchEvent(new Event('keyup'));
    expect(settingsService.setSpacing).toHaveBeenCalledWith('6');
  });
});
