import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let el: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsService = jasmine.createSpyObj('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing',
    ]);
    settingsService.settings = {
      showSettings: true,
      openLinkInNewTab: true,
      theme: 'night',
      titleFontSize: '18',
      listSpacing: '4',
    };

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    });

    fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  function input(selector: string): HTMLInputElement {
    return el.querySelector(selector) as HTMLInputElement;
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reflects the current settings', () => {
    expect(input('input[type=checkbox]').checked).toBe(true);
    expect(input('input[value=night]').checked).toBe(true);
    expect(input('input[value=default]').checked).toBe(false);
    expect(input('input[type=number][min="1"]').value).toBe('18');
    expect(input('input[type=number][min="0"]').value).toBe('4');
  });

  it('closes via toggleSettings', () => {
    (el.querySelector('.close') as HTMLElement).click();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggles opening links in a new tab', () => {
    input('input[type=checkbox]').dispatchEvent(new Event('change'));

    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('selects a theme', () => {
    input('input[value=amoledblack]').click();

    expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');
  });

  it('changes the title font size and list spacing on keyup', () => {
    const font = input('input[type=number][min="1"]');
    font.value = '20';
    font.dispatchEvent(new KeyboardEvent('keyup'));

    const spacing = input('input[type=number][min="0"]');
    spacing.value = '10';
    spacing.dispatchEvent(new KeyboardEvent('keyup'));

    expect(settingsService.setFont).toHaveBeenCalledWith('20');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });
});
