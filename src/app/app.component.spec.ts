import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let routerEventsSubject: Subject<any>;
  let mockSettingsService: any;
  let gaSpy: jasmine.Spy;

  beforeEach(async(() => {
    routerEventsSubject = new Subject();

    mockSettingsService = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize settings from SettingsService', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.settings).toBe(mockSettingsService.settings);
  });

  it('should call ga on NavigationEnd event', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const router = TestBed.get(Router);

    const navEnd = new NavigationEnd(1, '/news', '/news');
    (router.events as Subject<any>).next(navEnd);

    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  });
});
