import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { createMockSettingsService } from '../testing/mock-settings.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let routerEvents: Subject<any>;
  let gaSpy: jasmine.Spy;
  let settingsService: ReturnType<typeof createMockSettingsService>;

  beforeEach(async () => {
    routerEvents = new Subject<any>();
    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;
    settingsService = createMockSettingsService();
    settingsService.settings.theme = 'night';

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: Router, useValue: { events: routerEvents.asObservable() } },
        { provide: SettingsService, useValue: settingsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('exposes settings from the SettingsService', () => {
    expect(component.settings).toBe(settingsService.settings);
  });

  it('applies the current theme as the root class', () => {
    const root: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(root.className).toBe('night');
  });

  it('renders header, router outlet and footer', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('router-outlet')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
  });

  it('records a pageview on NavigationEnd', () => {
    routerEvents.next(new NavigationEnd(1, '/news', '/news/1'));
    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  });

  it('ignores non-NavigationEnd router events', () => {
    routerEvents.next(new NavigationStart(1, '/news'));
    expect(gaSpy).not.toHaveBeenCalled();
  });
});
