import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let mockSettingsService: any;

  beforeEach(async(() => {
    mockSettingsService = {
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
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have settings populated from SettingsService', () => {
    expect(component.settings).toEqual(mockSettingsService.settings);
  });

  it('toggleSettings() should call _settingsService.toggleSettings()', () => {
    component.toggleSettings();
    expect(mockSettingsService.toggleSettings).toHaveBeenCalled();
  });

  it('scrollTop() should call window.scrollTo(0, 0)', () => {
    spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
