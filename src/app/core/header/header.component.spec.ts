import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createSettingsServiceSpy } from '../../../testing/mocks';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsService = createSettingsServiceSpy();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('renders navigation links for each feed', () => {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    expect(links.map(a => a.getAttribute('href'))).toEqual(['/news/1', '/newest/1', '/show/1', '/ask/1', '/jobs/1']);
    expect(links.slice(1).map(a => a.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('toggles settings via SettingsService when the cog is clicked', () => {
    fixture.nativeElement.querySelector('img.settings').click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('only renders the settings panel when showSettings is true', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();

    settingsService.settings.showSettings = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-settings')).not.toBeNull();
  });

  it('scrolls to top when a nav link is clicked', () => {
    const scrollSpy = spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });
});
