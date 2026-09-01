import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let settingsService: jasmine.SpyObj<SettingsService>;
  const settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  beforeEach(() => {
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['toggleSettings']);
    (settingsService as any).settings = settings;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is created with the settings from the settings service', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings as any);
  });

  it('toggleSettings delegates to the settings service', () => {
    component.toggleSettings();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('clicking the cog toggles the settings panel', () => {
    fixture.nativeElement.querySelector('img.settings').click();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('scrollTop scrolls the window to the top', () => {
    const scrollTo = spyOn(window, 'scrollTo');

    component.scrollTop();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('links to each feed', () => {
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.header-nav a')
    );

    expect(links.map(link => link.textContent.trim())).toEqual(['new', 'show', 'ask', 'jobs']);
  });
});
