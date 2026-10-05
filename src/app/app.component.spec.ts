import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

@Component({ template: '<p class="routed">routed page</p>' })
class RoutedStubComponent {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let settings: Settings;
  let ga: jasmine.Spy;
  let originalGa: any;

  beforeEach(() => {
    originalGa = (window as any).ga;
    ga = jasmine.createSpy('ga');
    (window as any).ga = ga;

    settings = {
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'night',
      titleFontSize: '16',
      listSpacing: '0',
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'news/1', pathMatch: 'full' },
          { path: 'news/:page', component: RoutedStubComponent },
        ]),
      ],
      declarations: [AppComponent, RoutedStubComponent],
      providers: [{ provide: SettingsService, useValue: { settings } }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(AppComponent);
  });

  afterEach(() => {
    (window as any).ga = originalGa;
  });

  it('creates the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the app shell with header, router outlet and footer', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.wrapper app-header')).toBeTruthy();
    expect(el.querySelector('.wrapper router-outlet')).toBeTruthy();
    expect(el.querySelector('.wrapper app-footer')).toBeTruthy();
  });

  it('applies the current theme as a class on the root element', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.firstElementChild.className).toBe('night');

    settings.theme = 'amoledblack';
    fixture.detectChanges();
    expect(fixture.nativeElement.firstElementChild.className).toBe('amoledblack');
  });

  it('sends a Google Analytics pageview on navigation', fakeAsync(() => {
    const router = TestBed.inject(Router);
    fixture.ngZone.run(() => router.navigate(['']));
    tick();

    expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  }));
});
