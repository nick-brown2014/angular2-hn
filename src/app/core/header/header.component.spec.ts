import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settingsService: { settings: any; toggleSettings: jasmine.Spy };

  beforeEach(() => {
    settingsService = {
      settings: { showSettings: false },
      toggleSettings: jasmine.createSpy('toggleSettings').and.callFake(() => {
        settingsService.settings.showSettings = !settingsService.settings.showSettings;
      }),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      // app-settings is covered by its own spec
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders navigation links for each feed', () => {
    const links = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('.header-nav a'));

    expect(links.map(link => link.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/newest/1', '/show/1', '/ask/1', '/jobs/1']);
    expect(fixture.nativeElement.querySelector('.home-link').getAttribute('href')).toBe('/news/1');
  });

  it('toggles the settings popup when the cog is clicked', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();

    fixture.nativeElement.querySelector('img.settings').click();
    fixture.detectChanges();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('app-settings')).not.toBeNull();
  });

  it('scrolls to the top when a nav link is clicked', () => {
    spyOn(window, 'scrollTo');

    component.scrollTop();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
