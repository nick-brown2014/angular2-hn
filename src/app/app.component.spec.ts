import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

declare const window: any;

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let settingsServiceStub: any;
  let originalGa: any;

  beforeEach(() => {
    settingsServiceStub = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    originalGa = window.ga;
    window.ga = jasmine.createSpy('ga');

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [{ provide: SettingsService, useValue: settingsServiceStub }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    window.ga = originalGa;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('exposes settings from the SettingsService', () => {
    expect(component.settings).toBe(settingsServiceStub.settings);
  });

  it('sends a Google Analytics pageview on NavigationEnd events', () => {
    const events$ = new Subject<any>();
    const routerStub = { events: events$.asObservable() } as Router;

    TestBed.resetTestingModule();
    window.ga = jasmine.createSpy('ga');
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: SettingsService, useValue: settingsServiceStub },
        { provide: Router, useValue: routerStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fx = TestBed.createComponent(AppComponent);
    fx.detectChanges();

    events$.next(new NavigationEnd(1, '/news/1', '/news/1'));
    expect(window.ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(window.ga).toHaveBeenCalledWith('send', 'pageview');

    (window.ga as jasmine.Spy).calls.reset();
    events$.next(new NavigationStart(2, '/news/2'));
    expect(window.ga).not.toHaveBeenCalled();
  });
});
