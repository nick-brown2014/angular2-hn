import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settings: Settings;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'default', titleFontSize: '16', listSpacing: '0' };
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['toggleSettings']);
    settingsService.settings = settings;
    settingsService.toggleSettings.and.callFake(() => settings.showSettings = !settings.showSettings);

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
    expect(component.settings).toBe(settings);
  });

  it('renders the nav links', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('.header-nav a')) as HTMLElement[];
    expect(links.map(a => a.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(fixture.nativeElement.querySelector('a.home-link img.logo')).toBeTruthy();
  });

  it('does not render the settings panel by default', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();
  });

  it('toggles the settings panel via SettingsService when the cog is clicked', () => {
    const cog: HTMLElement = fixture.nativeElement.querySelector('img.settings');
    cog.click();
    fixture.detectChanges();

    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('app-settings')).toBeTruthy();
  });

  it('scrollTop scrolls the window to the top', () => {
    const scrollSpy = spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('scrolls to the top when a nav link is clicked', () => {
    const scrollSpy = spyOn(window, 'scrollTo');
    const link: HTMLElement = fixture.nativeElement.querySelector('.header-nav a');
    link.click();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });
});
