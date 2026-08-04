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
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component and exposes the shared settings', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settingsService.settings);
  });

  it('delegates toggling the settings panel to the settings service', () => {
    component.toggleSettings();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggles the settings panel when the cog is clicked', () => {
    const cog: HTMLElement = fixture.nativeElement.querySelector('img.settings');

    cog.click();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('scrolls back to the top of the page', () => {
    const scrollTo = spyOn(window, 'scrollTo');

    component.scrollTop();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('links to each feed', () => {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('.header-nav a'));

    expect(links.map(link => link.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
  });
});
