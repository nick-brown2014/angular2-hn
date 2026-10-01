import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { mockSettings } from '../../testing/mock-data';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let element: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]);
    settingsService.settings = mockSettings();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent, SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('creates and shares the settings object from SettingsService', () => {
    expect(fixture.componentInstance.settings).toBe(settingsService.settings);
  });

  it('links the logo to the first page of top stories', () => {
    const home: HTMLAnchorElement = element.querySelector('a.home-link');
    expect(home.getAttribute('href')).toBe('/news/1');
  });

  it('renders navigation links for each feed', () => {
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('.header-nav a'));

    expect(links.map(a => a.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/newest/1', '/show/1', '/ask/1', '/jobs/1']);
  });

  it('scrolls to the top when a navigation link is clicked', () => {
    spyOn(window, 'scrollTo');
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    element.querySelector<HTMLAnchorElement>('.header-nav a').click();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('toggles the settings panel when the cog is clicked', () => {
    element.querySelector<HTMLImageElement>('img.settings').click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('renders the settings panel only when showSettings is true', () => {
    expect(element.querySelector('app-settings')).toBeNull();

    settingsService.settings.showSettings = true;
    fixture.detectChanges();

    expect(element.querySelector('app-settings')).not.toBeNull();
  });
});
