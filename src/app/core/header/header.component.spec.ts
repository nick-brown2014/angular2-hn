import { Location } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

@Component({ template: '' })
class RoutedStubComponent {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;
  let settings: Settings;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    };
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['toggleSettings']);
    settingsService.settings = settings;
    settingsService.toggleSettings.and.callFake(() => (settings.showSettings = !settings.showSettings));

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', component: RoutedStubComponent }])],
      declarations: [HeaderComponent, RoutedStubComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HeaderComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('links the logo to the front page', () => {
    const home = el.querySelector('a.home-link');
    expect(home.getAttribute('href')).toBe('/news/1');
    expect(home.querySelector('img.logo').getAttribute('alt')).toBe('Logo');
  });

  it('renders the feed navigation links', () => {
    const links = Array.from(el.querySelectorAll('.header-nav a'));
    expect(links.map(a => a.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/newest/1', '/show/1', '/ask/1', '/jobs/1']);
  });

  it('navigates and scrolls to the top when a navigation link is clicked', fakeAsync(() => {
    const scrollTo = spyOn(window, 'scrollTo');
    const link: HTMLAnchorElement = el.querySelector('.header-nav a');
    fixture.ngZone.run(() => link.dispatchEvent(new MouseEvent('click', { button: 0, cancelable: true })));
    tick();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(TestBed.inject(Location).path()).toBe('/newest/1');
  }));

  it('does not show the settings panel by default', () => {
    expect(el.querySelector('app-settings')).toBeNull();
  });

  it('toggles the settings panel when the cog is clicked', () => {
    const cog: HTMLElement = el.querySelector('img.settings');

    cog.click();
    fixture.detectChanges();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
    expect(el.querySelector('app-settings')).toBeTruthy();

    cog.click();
    fixture.detectChanges();
    expect(el.querySelector('app-settings')).toBeNull();
  });
});
