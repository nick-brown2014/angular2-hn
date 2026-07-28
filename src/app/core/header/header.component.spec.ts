import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settingsService: { settings: any; toggleSettings: jasmine.Spy };

  beforeEach(() => {
    settingsService = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      },
      toggleSettings: jasmine.createSpy('toggleSettings')
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the settings from the settings service', () => {
    expect(component.settings).toBe(settingsService.settings);
  });

  it('should delegate toggling the settings panel to the settings service', () => {
    component.toggleSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should scroll to the top of the page', () => {
    spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
