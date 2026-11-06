import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createSettingsServiceSpy } from '../../../testing/mocks';

@Component({ template: '' })
class BlankComponent {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  function navLink(text: string): HTMLAnchorElement {
    return Array.from(el.querySelectorAll<HTMLAnchorElement>('.header-nav a')).find(a => a.textContent.trim() === text);
  }

  beforeEach(() => {
    settingsService = createSettingsServiceSpy();
    settingsService.toggleSettings.and.callFake(() => {
      settingsService.settings.showSettings = !settingsService.settings.showSettings;
    });
    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', component: BlankComponent }])],
      declarations: [HeaderComponent, SettingsComponent, BlankComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('links the logo to the first page of top stories', () => {
    const home: HTMLAnchorElement = el.querySelector('a.home-link');

    expect(home.getAttribute('href')).toBe('/news/1');
    expect(home.querySelector('img.logo').getAttribute('alt')).toBe('Logo');
  });

  it('renders nav links for each feed', () => {
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.header-nav a')).map(a => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href'),
    }));

    expect(links).toEqual([
      { text: 'new', href: '/newest/1' },
      { text: 'show', href: '/show/1' },
      { text: 'ask', href: '/ask/1' },
      { text: 'jobs', href: '/jobs/1' },
    ]);
  });

  it('navigates, scrolls to the top and marks the link active when a nav link is clicked', fakeAsync(() => {
    const location = TestBed.inject(Location);

    fixture.ngZone.run(() => navLink('ask').click());
    tick();
    fixture.detectChanges();

    expect(location.path()).toBe('/ask/1');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(navLink('ask').classList).toContain('active');
    expect(navLink('new').classList).not.toContain('active');
  }));

  it('scrolls to the top when the logo is clicked', fakeAsync(() => {
    fixture.ngZone.run(() => (el.querySelector('a.home-link') as HTMLElement).click());
    tick();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(TestBed.inject(Location).path()).toBe('/news/1');
  }));

  it('hides the settings panel until the cog is clicked, then toggles it', () => {
    const cog: HTMLElement = el.querySelector('img.settings');
    expect(el.querySelector('app-settings')).toBeNull();

    cog.click();
    fixture.detectChanges();
    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
    expect(el.querySelector('app-settings h1').textContent).toBe('Settings');

    cog.click();
    fixture.detectChanges();
    expect(el.querySelector('app-settings')).toBeNull();
  });

  it('closes the settings panel from its × button', () => {
    (el.querySelector('img.settings') as HTMLElement).click();
    fixture.detectChanges();

    (el.querySelector('app-settings .close') as HTMLElement).click();
    fixture.detectChanges();

    expect(el.querySelector('app-settings')).toBeNull();
  });
});
