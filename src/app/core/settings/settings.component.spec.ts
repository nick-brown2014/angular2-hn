import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createSettingsServiceSpy, makeSettings } from '../../../testing/mocks';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let el: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  function themeRadio(value: string): HTMLInputElement {
    return el.querySelector(`input[type="radio"][value="${value}"]`);
  }

  function numberInputs(): HTMLInputElement[] {
    return Array.from(el.querySelectorAll('input[type="number"]'));
  }

  beforeEach(() => {
    settingsService = createSettingsServiceSpy(
      makeSettings({ showSettings: true, openLinkInNewTab: true, theme: 'night', titleFontSize: '18', listSpacing: '4' })
    );
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    });
    fixture = TestBed.createComponent(SettingsComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('exposes the shared settings object from the service', () => {
    expect(fixture.componentInstance.settings).toBe(settingsService.settings);
  });

  it('renders the current settings', () => {
    const checkbox: HTMLInputElement = el.querySelector('input[type="checkbox"]');
    const [fontSize, listSpacing] = numberInputs();

    expect(el.querySelector('h1').textContent).toBe('Settings');
    expect(checkbox.checked).toBe(true);
    expect(themeRadio('default').checked).toBe(false);
    expect(themeRadio('night').checked).toBe(true);
    expect(themeRadio('amoledblack').checked).toBe(false);
    expect(fontSize.value).toBe('18');
    expect(listSpacing.value).toBe('4');
  });

  it('closes via the × button', () => {
    (el.querySelector('.close') as HTMLElement).click();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('toggles "open links in a new tab" when the checkbox changes', () => {
    const checkbox: HTMLInputElement = el.querySelector('input[type="checkbox"]');
    checkbox.click();

    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);
  });

  it('selects each theme from its radio button', () => {
    themeRadio('amoledblack').click();
    themeRadio('default').click();
    themeRadio('night').click();

    expect(settingsService.setTheme.calls.allArgs()).toEqual([['amoledblack'], ['default'], ['night']]);
  });

  it('reflects a theme change made elsewhere', () => {
    settingsService.settings.theme = 'amoledblack';
    fixture.detectChanges();

    expect(themeRadio('amoledblack').checked).toBe(true);
    expect(themeRadio('night').checked).toBe(false);
  });

  it('sets the title font size on keyup', () => {
    const [fontSize] = numberInputs();
    fontSize.value = '24';
    fontSize.dispatchEvent(new KeyboardEvent('keyup'));

    expect(settingsService.setFont).toHaveBeenCalledWith('24');
  });

  it('sets the list spacing on keyup', () => {
    const [, listSpacing] = numberInputs();
    listSpacing.value = '10';
    listSpacing.dispatchEvent(new KeyboardEvent('keyup'));

    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });
});
