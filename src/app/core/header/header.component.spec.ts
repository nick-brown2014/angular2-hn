import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService> & { settings: Settings };

  beforeEach(async () => {
    settingsServiceSpy = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings'
    ]) as jasmine.SpyObj<SettingsService> & { settings: Settings };
    settingsServiceSpy.settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: SettingsService, useValue: settingsServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('toggleSettings should call settingsService.toggleSettings', () => {
    component.toggleSettings();
    expect(settingsServiceSpy.toggleSettings).toHaveBeenCalled();
  });

  it('scrollTop should call window.scrollTo with (0, 0)', () => {
    const scrollSpy = spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });
});
