import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let settings: Settings;
  let gaSpy: jasmine.Spy;

  beforeEach(() => {
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0'
    };
    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [{ provide: SettingsService, useValue: { settings } }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the settings from the settings service', () => {
    expect(component.settings).toBe(settings);
  });

  it('should apply the current theme as a class', () => {
    expect(fixture.nativeElement.querySelector('.default')).toBeTruthy();
  });

  it('should track a page view on navigation end', () => {
    const router = TestBed.inject(Router);
    (router.events as any).next(new NavigationEnd(1, '/news/1', '/news/1'));

    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  });
});
