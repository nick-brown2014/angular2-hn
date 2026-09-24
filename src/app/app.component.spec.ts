import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let routerEvents: Subject<any>;
  let settings: Settings;
  let gaSpy: jasmine.Spy;

  beforeEach(() => {
    routerEvents = new Subject<any>();
    settings = { showSettings: false, openLinkInNewTab: false, theme: 'night', titleFontSize: '16', listSpacing: '0' };
    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: SettingsService, useValue: { settings } },
        { provide: Router, useValue: { events: routerEvents.asObservable() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

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

  it('exposes the settings object from SettingsService', () => {
    expect(component.settings).toBe(settings);
  });

  it('applies the current theme as the root class', () => {
    const root: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(root.className).toBe('night');
  });

  it('reports a pageview to ga on NavigationEnd', () => {
    routerEvents.next(new NavigationEnd(1, '/news/1', '/news/1'));
    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  });

  it('ignores other router events', () => {
    routerEvents.next(new NavigationStart(1, '/news/1'));
    expect(gaSpy).not.toHaveBeenCalled();
  });
});
