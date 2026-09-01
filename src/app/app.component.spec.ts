import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerEvents: Subject<any>;
  let gaSpy: jasmine.Spy;
  let settings: Settings;

  beforeEach(async(() => {
    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;

    routerEvents = new Subject<any>();
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'night',
      titleFontSize: '16',
      listSpacing: '0',
    };

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: Router, useValue: { events: routerEvents.asObservable() } },
        { provide: SettingsService, useValue: { settings } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes settings from SettingsService and applies the theme class', () => {
    expect(component.settings).toBe(settings);
    const themeDiv: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(themeDiv.className).toContain('night');
  });

  it('tracks a pageview with ga on NavigationEnd', () => {
    routerEvents.next(new NavigationEnd(1, '/news/1', '/news/1'));

    expect(gaSpy).toHaveBeenCalledTimes(2);
    expect(gaSpy.calls.argsFor(0)).toEqual(['set', 'page', '/news/1']);
    expect(gaSpy.calls.argsFor(1)).toEqual(['send', 'pageview']);
  });

  it('uses urlAfterRedirects for the tracked page', () => {
    routerEvents.next(new NavigationEnd(1, '/', '/news/1'));
    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news/1');
  });

  it('ignores router events other than NavigationEnd', () => {
    routerEvents.next(new NavigationStart(1, '/news/1'));
    expect(gaSpy).not.toHaveBeenCalled();
  });
});
