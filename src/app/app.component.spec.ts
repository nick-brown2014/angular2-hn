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
      theme: 'night',
      titleFontSize: '16',
      listSpacing: '0'
    };
    gaSpy = jasmine.createSpy('ga');
    (window as any).ga = gaSpy;

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: SettingsService, useValue: { settings } }],
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

  it('takes its settings from the settings service', () => {
    expect(component.settings).toBe(settings);
    expect(component.settings.theme).toBe('night');
  });

  it('applies the current theme as a class', () => {
    const themed: HTMLElement = fixture.nativeElement.querySelector('.night');

    expect(themed).toBeTruthy();
  });

  it('tracks a pageview when navigation ends', () => {
    const router: Router = TestBed.inject(Router);

    (router.events as any).next(new NavigationEnd(1, '/news/1', '/news/1'));

    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  });

  it('does not track other router events', () => {
    const router: Router = TestBed.inject(Router);

    (router.events as any).next({ id: 2, url: '/news/1' });

    expect(gaSpy).not.toHaveBeenCalled();
  });
});
