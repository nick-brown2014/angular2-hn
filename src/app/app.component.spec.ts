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
  let settings: Settings;
  let ga: jasmine.Spy;

  beforeEach(() => {
    routerEvents = new Subject<any>();
    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'night',
      titleFontSize: '16',
      listSpacing: '0'
    };
    ga = jasmine.createSpy('ga');
    (window as any).ga = ga;

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: SettingsService, useValue: { settings } },
        { provide: Router, useValue: { events: routerEvents.asObservable() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('is created and takes its settings from the settings service', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings);
  });

  it('applies the active theme to the root element', () => {
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('div');
    expect(root.classList).toContain('night');
  });

  it('reports a page view to analytics on navigation end', () => {
    routerEvents.next(new NavigationEnd(1, '/news/1', '/news/1'));

    expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  });

  it('ignores router events that are not navigation ends', () => {
    routerEvents.next({ id: 2, url: '/news/1' });

    expect(ga).not.toHaveBeenCalled();
  });
});
