import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let settingsService: { settings: Settings; toggleSettings: jasmine.Spy };

  beforeEach(async(() => {
    settingsService = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0',
      },
      toggleSettings: jasmine.createSpy('toggleSettings'),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the settings from SettingsService', () => {
    expect(component.settings).toBe(settingsService.settings);
  });

  it('toggleSettings() delegates to SettingsService.toggleSettings', () => {
    component.toggleSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('scrollTop() scrolls the window to the top', () => {
    spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('clicking the settings cog toggles settings', () => {
    const cog: HTMLElement = fixture.nativeElement.querySelector('img.settings');
    cog.click();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('renders the settings panel only when showSettings is true', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();

    settingsService.settings.showSettings = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-settings')).not.toBeNull();
  });
});
