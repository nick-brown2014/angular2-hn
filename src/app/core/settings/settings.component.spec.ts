import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createSettings, createSettingsServiceSpy } from '../../../testing/mocks';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let el: HTMLElement;

  function themeRadio(value: string): HTMLInputElement {
    return el.querySelector(`input[type="radio"][value="${value}"]`);
  }

  function numberInputs(): HTMLInputElement[] {
    return Array.from(el.querySelectorAll('input[type="number"]'));
  }

  beforeEach(() => {
    settingsService = createSettingsServiceSpy(
      createSettings({ showSettings: true, openLinkInNewTab: true, theme: 'night', titleFontSize: '18', listSpacing: '4' })
    );

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

  it('reflects current settings in the controls', () => {
    expect((el.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true);
    expect(themeRadio('night').checked).toBe(true);
    expect(themeRadio('default').checked).toBe(false);
    expect(themeRadio('amoledblack').checked).toBe(false);
    expect(numberInputs().map(input => input.value)).toEqual(['18', '4']);
  });

  it('closes the panel via toggleSettings', () => {
    (el.querySelector('.close') as HTMLElement).click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggles open-links-in-new-tab when the checkbox changes', () => {
    el.querySelector('input[type="checkbox"]').dispatchEvent(new Event('change'));
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('sets the selected theme', () => {
    themeRadio('amoledblack').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');

    themeRadio('default').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('default');
  });

  it('updates the title font size on keyup', () => {
    const [fontInput] = numberInputs();
    fontInput.value = '24';
    fontInput.dispatchEvent(new Event('keyup'));
    expect(settingsService.setFont).toHaveBeenCalledWith('24');
  });

  it('updates the list spacing on keyup', () => {
    const [, spacingInput] = numberInputs();
    spacingInput.value = '10';
    spacingInput.dispatchEvent(new Event('keyup'));
    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });
});
