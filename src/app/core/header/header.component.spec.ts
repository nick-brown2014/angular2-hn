import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createSettingsServiceSpy } from '../../shared/testing/mocks';

@Component({ template: '' })
class RoutedStubComponent {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let element: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsService = createSettingsServiceSpy();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', component: RoutedStubComponent }])],
      declarations: [HeaderComponent, RoutedStubComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should link the logo to the front page', () => {
    const homeLink = element.querySelector('a.home-link');
    expect(homeLink.getAttribute('href')).toBe('/news/1');
    expect(homeLink.querySelector('img.logo').getAttribute('src')).toBe('assets/images/logo.svg');
  });

  it('should render navigation links for each feed', () => {
    const links = Array.from(element.querySelectorAll('.header-nav a'));

    expect(links.map(link => link.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/newest/1', '/show/1', '/ask/1', '/jobs/1']);
  });

  it('should scroll to the top when a navigation link is clicked', () => {
    spyOn(window, 'scrollTo');

    (element.querySelector('.header-nav a') as HTMLElement).click();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should toggle settings through the service when the cog is clicked', () => {
    (element.querySelector('img.settings') as HTMLElement).click();

    expect(settingsService.toggleSettings).toHaveBeenCalledTimes(1);
  });

  it('should only render the settings panel when settings are shown', () => {
    expect(element.querySelector('app-settings')).toBeNull();

    settingsService.settings.showSettings = true;
    fixture.detectChanges();

    expect(element.querySelector('app-settings')).toBeTruthy();
  });
});
