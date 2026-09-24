import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createMockSettingsService } from '../../../testing/mock-settings.service';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settingsService: ReturnType<typeof createMockSettingsService>;

  beforeEach(async () => {
    settingsService = createMockSettingsService();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders the navigation links', () => {
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('.header-nav a');
    const labels = Array.from(links).map(a => a.textContent.trim());
    expect(labels).toEqual(['new', 'show', 'ask', 'jobs']);
  });

  it('delegates toggleSettings to the SettingsService', () => {
    component.toggleSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggles settings when the cog is clicked', () => {
    fixture.nativeElement.querySelector('img.settings').click();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('scrolls to the top', () => {
    const scrollSpy = spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('only shows the settings panel when showSettings is true', () => {
    expect(fixture.nativeElement.querySelector('app-settings')).toBeNull();
    settingsService.settings.showSettings = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-settings')).toBeTruthy();
  });
});
