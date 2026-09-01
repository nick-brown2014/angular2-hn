import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settingsService: { settings: Settings; toggleSettings: jasmine.Spy };

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
    expect(component.settings).toBe(settingsService.settings);
  });

  it('should delegate settings toggling to the settings service', () => {
    component.toggleSettings();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('should scroll to the top of the page', () => {
    spyOn(window, 'scrollTo');

    component.scrollTop();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
