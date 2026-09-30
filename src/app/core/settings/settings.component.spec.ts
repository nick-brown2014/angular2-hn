import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createSettingsServiceSpy } from '../../shared/testing/mocks';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let element: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  function themeInput(theme: string): HTMLInputElement {
    return element.querySelector(`input[type="radio"][value="${theme}"]`);
  }

  function numberInputs(): HTMLInputElement[] {
    return Array.from(element.querySelectorAll('input[type="number"]'));
  }

  function keyup(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new KeyboardEvent('keyup'));
  }

  beforeEach(() => {
    settingsService = createSettingsServiceSpy({
      openLinkInNewTab: true,
      theme: 'night',
      titleFontSize: '18',
      listSpacing: '4'
    });

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    });

    fixture = TestBed.createComponent(SettingsComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(element.querySelector('h1').textContent).toBe('Settings');
  });

  it('should reflect the current settings in the form', () => {
    const [fontSize, listSpacing] = numberInputs();

    expect((element.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true);
    expect(themeInput('default').checked).toBe(false);
    expect(themeInput('night').checked).toBe(true);
    expect(themeInput('amoledblack').checked).toBe(false);
    expect(fontSize.value).toBe('18');
    expect(listSpacing.value).toBe('4');
  });

  it('should close the settings panel', () => {
    (element.querySelector('.close') as HTMLElement).click();

    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('should toggle opening links in a new tab', () => {
    element.querySelector('input[type="checkbox"]').dispatchEvent(new Event('change'));

    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalledTimes(1);
  });

  it('should select a theme', () => {
    themeInput('amoledblack').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');

    themeInput('default').click();
    expect(settingsService.setTheme).toHaveBeenCalledWith('default');
  });

  it('should update the title font size', () => {
    keyup(numberInputs()[0], '24');

    expect(settingsService.setFont).toHaveBeenCalledWith('24');
  });

  it('should update the list spacing', () => {
    keyup(numberInputs()[1], '10');

    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });
});
