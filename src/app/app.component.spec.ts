import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let routerEvents: Subject<any>;
  let gaSpy: jasmine.Spy;
  let originalGa: any;

  const settings: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'night',
    titleFontSize: '16',
    listSpacing: '0'
  };

  beforeEach(() => {
    originalGa = (window as any).ga;
    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;

    routerEvents = new Subject<any>();

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: SettingsService, useValue: { settings } },
        { provide: Router, useValue: { events: routerEvents } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    (window as any).ga = originalGa;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize settings from the settings service', () => {
    expect(component.settings).toBe(settings);
  });

  it('should apply the current theme to the root element', () => {
    const root: HTMLElement = fixture.nativeElement.querySelector('div');

    expect(root.className).toContain('night');
  });

  it('should report a pageview to analytics on NavigationEnd', () => {
    routerEvents.next(new NavigationEnd(1, '/news/1', '/news/1'));

    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  });

  it('should ignore router events other than NavigationEnd', () => {
    routerEvents.next({ id: 2, url: '/news/2' });

    expect(gaSpy).not.toHaveBeenCalled();
  });
});
