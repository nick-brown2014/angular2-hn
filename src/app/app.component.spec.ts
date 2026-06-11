import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  let routerEventsSubject: Subject<any>;
  let mockSettingsService: any;
  let mockRouter: any;

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

    mockRouter = {
      events: routerEventsSubject.asObservable()
    };

    (window as any).ga = jasmine.createSpy('ga');

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should set settings from SettingsService', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.settings).toBe(mockSettingsService.settings);
  });

  it('should call ga on NavigationEnd events', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const navEnd = new NavigationEnd(1, '/news/1', '/news/1');
    routerEventsSubject.next(navEnd);

    expect((window as any).ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect((window as any).ga).toHaveBeenCalledWith('send', 'pageview');
  });

  it('should not call ga for non-NavigationEnd events', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    routerEventsSubject.next({ id: 1, url: '/test' });

    expect((window as any).ga).not.toHaveBeenCalled();
  });

  it('should use urlAfterRedirects for ga page tracking', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const navEnd = new NavigationEnd(1, '/', '/news/1');
    routerEventsSubject.next(navEnd);

    expect((window as any).ga).toHaveBeenCalledWith('set', 'page', '/news/1');
  });
});
