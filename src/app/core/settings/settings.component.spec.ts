import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createSettingsServiceStub, makeSettings, SettingsServiceStub } from '../../../testing/mocks';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let el: HTMLElement;

  function themeRadio(value: string): HTMLInputElement {
    return el.querySelector(`input[type="radio"][value="${value}"]`);
  }

  function keyup(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new KeyboardEvent('keyup'));
  }

  describe('with a stubbed SettingsService', () => {
    let settingsService: SettingsServiceStub;

    function setup(overrides = {}) {
      settingsService = createSettingsServiceStub(makeSettings(overrides));
      TestBed.configureTestingModule({
        declarations: [SettingsComponent],
        providers: [{ provide: SettingsService, useValue: settingsService }],
      });
      fixture = TestBed.createComponent(SettingsComponent);
      fixture.detectChanges();
      el = fixture.nativeElement;
    }

    it('offers the Default, Night and AMOLED themes', () => {
      setup();
      const labels = Array.from(el.querySelectorAll('.theme-controls label'))
        .slice(0, 3)
        .map(label => label.textContent.trim());
      expect(labels).toEqual(['Default', 'Night', 'Black (AMOLED)']);
      expect(themeRadio('default')).toBeTruthy();
      expect(themeRadio('night')).toBeTruthy();
      expect(themeRadio('amoledblack')).toBeTruthy();
    });

    ['default', 'night', 'amoledblack'].forEach(theme => {
      it(`checks only the ${theme} radio when it is the current theme`, () => {
        setup({ theme });
        const checked = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
          .filter(input => input.checked)
          .map(input => input.value);
        expect(checked).toEqual([theme]);
      });

      it(`selects the ${theme} theme when its radio is clicked`, () => {
        setup({ theme: theme === 'default' ? 'night' : 'default' });
        themeRadio(theme).click();
        expect(settingsService.setTheme).toHaveBeenCalledWith(theme);
      });
    });

    it('reflects and toggles the open-in-new-tab preference', () => {
      setup({ openLinkInNewTab: true });
      const checkbox: HTMLInputElement = el.querySelector('input[type="checkbox"]');
      expect(checkbox.checked).toBe(true);

      checkbox.click();
      expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
    });

    it('shows the current font size and list spacing and updates them on keyup', () => {
      setup({ titleFontSize: '18', listSpacing: '4' });
      const [fontInput, spacingInput] = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="number"]'));
      expect(fontInput.value).toBe('18');
      expect(spacingInput.value).toBe('4');

      keyup(fontInput, '24');
      expect(settingsService.setFont).toHaveBeenCalledWith('24');

      keyup(spacingInput, '10');
      expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
    });

    it('closes the panel via the close button', () => {
      setup();
      (el.querySelector('.close') as HTMLElement).click();
      expect(settingsService.toggleSettings).toHaveBeenCalled();
    });
  });

  describe('with the real SettingsService', () => {
    let store: { [key: string]: string };
    let service: SettingsService;

    beforeEach(() => {
      store = {};
      spyOn(Storage.prototype, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
      spyOn(Storage.prototype, 'setItem').and.callFake((key: string, value: string) => (store[key] = String(value)));
      spyOn(window, 'matchMedia').and.returnValue(
        Object.assign(new EventTarget(), { media: '(prefers-color-scheme: dark)', matches: false }) as any
      );

      TestBed.configureTestingModule({ declarations: [SettingsComponent] });
      service = TestBed.inject(SettingsService);
      fixture = TestBed.createComponent(SettingsComponent);
      fixture.detectChanges();
      el = fixture.nativeElement;
    });

    it('applies and persists each theme the user picks', () => {
      ['night', 'amoledblack', 'default'].forEach(theme => {
        themeRadio(theme).click();
        fixture.detectChanges();
        expect(service.settings.theme).toBe(theme);
        expect(store.theme).toBe(theme);
        expect(themeRadio(theme).checked).toBe(true);
      });
    });

    it('persists font size and spacing changes', () => {
      const [fontInput, spacingInput] = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="number"]'));
      keyup(fontInput, '20');
      keyup(spacingInput, '6');
      expect(store.titleFontSize).toBe('20');
      expect(store.listSpacing).toBe('6');
    });
  });
});
