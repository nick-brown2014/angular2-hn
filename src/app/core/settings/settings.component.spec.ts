import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { mockSettings } from '../../testing/mock-data';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let element: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  const themeRadio = (theme: string) =>
    element.querySelector<HTMLInputElement>(`input[type="radio"][value="${theme}"]`);
  const numberInputs = () => element.querySelectorAll<HTMLInputElement>('input[type="number"]');

  function render(overrides = {}) {
    settingsService.settings = mockSettings({ showSettings: true, ...overrides });
    fixture = TestBed.createComponent(SettingsComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(() => {
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]);

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    });
  });

  it('renders the settings popup', () => {
    render();
    expect(element.querySelector('.overlay .popup h1').textContent).toBe('Settings');
  });

  it('closes the panel via the close button', () => {
    render();
    element.querySelector<HTMLElement>('.close').click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  describe('links', () => {
    it('reflects the openLinkInNewTab setting', () => {
      render({ openLinkInNewTab: true });
      expect(element.querySelector<HTMLInputElement>('input[type="checkbox"]').checked).toBe(true);
    });

    it('toggles openLinkInNewTab when the checkbox changes', () => {
      render();
      const checkbox = element.querySelector<HTMLInputElement>('input[type="checkbox"]');

      checkbox.click();

      expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });
  });

  describe('theme', () => {
    ['default', 'night', 'amoledblack'].forEach(theme => {
      it(`checks the ${theme} radio when it is the active theme`, () => {
        render({ theme });

        expect(themeRadio(theme).checked).toBe(true);
        ['default', 'night', 'amoledblack']
          .filter(other => other !== theme)
          .forEach(other => expect(themeRadio(other).checked).toBe(false));
      });
    });

    it('selects a theme when its radio is clicked', () => {
      render();

      themeRadio('night').click();
      expect(settingsService.setTheme).toHaveBeenCalledWith('night');

      themeRadio('amoledblack').click();
      expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');
    });
  });

  describe('font size and spacing', () => {
    it('shows the current title font size and list spacing', () => {
      render({ titleFontSize: '18', listSpacing: '4' });
      const [fontInput, spacingInput] = Array.from(numberInputs());

      expect(fontInput.value).toBe('18');
      expect(spacingInput.value).toBe('4');
    });

    it('updates the title font size on keyup', () => {
      render();
      const fontInput = numberInputs()[0];

      fontInput.value = '24';
      fontInput.dispatchEvent(new KeyboardEvent('keyup'));

      expect(settingsService.setFont).toHaveBeenCalledWith('24');
    });

    it('updates the list spacing on keyup', () => {
      render();
      const spacingInput = numberInputs()[1];

      spacingInput.value = '10';
      spacingInput.dispatchEvent(new KeyboardEvent('keyup'));

      expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
    });
  });
});
