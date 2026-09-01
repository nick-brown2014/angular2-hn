import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settings: Settings;
  let settingsService: { settings: Settings; toggleSettings: jasmine.Spy };

  beforeEach(() => {
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };
    settingsService = { settings, toggleSettings: jasmine.createSpy('toggleSettings') };

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('creates and reads the settings from the service', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('toggleSettings delegates to the settings service', () => {
    component.toggleSettings();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('scrollTop scrolls the window back to the top', () => {
    const scrollTo = spyOn(window, 'scrollTo');

    component.scrollTop();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
