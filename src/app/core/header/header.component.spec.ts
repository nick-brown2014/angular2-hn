import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsComponent } from '../settings/settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { BlankComponent, createSettingsServiceStub, SettingsServiceStub } from '../../../testing/mocks';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;
  let settingsService: SettingsServiceStub;

  beforeEach(() => {
    settingsService = createSettingsServiceStub();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', component: BlankComponent }])],
      declarations: [HeaderComponent, SettingsComponent, BlankComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the logo linking to the first news page', () => {
    const home: HTMLAnchorElement = el.querySelector('a.home-link');
    expect(home.getAttribute('href')).toBe('/news/1');
    expect(home.querySelector('img.logo').getAttribute('alt')).toBe('Logo');
  });

  it('renders the feed navigation links', () => {
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

  it('hides the settings panel until it is toggled on', () => {
    expect(el.querySelector('app-settings')).toBeNull();

    settingsService.settings.showSettings = true;
    fixture.detectChanges();

    expect(el.querySelector('app-settings')).not.toBeNull();
  });

  it('toggles settings when the cog is clicked', () => {
    (el.querySelector('img.settings') as HTMLElement).click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('scrolls to the top when a nav link is clicked', fakeAsync(() => {
    const scrollSpy = spyOn(window, 'scrollTo');
    fixture.ngZone.run(() => (el.querySelector('.header-nav a') as HTMLElement).click());
    tick();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  }));
});
