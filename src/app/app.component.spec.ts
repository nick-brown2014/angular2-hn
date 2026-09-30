import { Component, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { createSettingsServiceSpy } from './shared/testing/mocks';

@Component({ template: '<p class="routed">routed</p>' })
class RoutedStubComponent {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let element: HTMLElement;
  let ga: jasmine.Spy;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    ga = jasmine.createSpy('ga');
    (window as unknown as { ga: jasmine.Spy }).ga = ga;
    settingsService = createSettingsServiceSpy({ theme: 'night' });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: '', redirectTo: 'news/1', pathMatch: 'full' },
        { path: 'news/:page', component: RoutedStubComponent }
      ])],
      declarations: [AppComponent, RoutedStubComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(AppComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as unknown as { ga?: jasmine.Spy }).ga;
  });

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the header, router outlet and footer', () => {
    const wrapper = element.querySelector('.wrapper');
    expect(wrapper.querySelector('app-header')).toBeTruthy();
    expect(wrapper.querySelector('router-outlet')).toBeTruthy();
    expect(wrapper.querySelector('app-footer')).toBeTruthy();
  });

  it('should apply the current theme as a class on the root element', () => {
    const themeRoot = element.firstElementChild as HTMLElement;
    expect(themeRoot.className).toBe('night');

    settingsService.settings.theme = 'amoledblack';
    fixture.detectChanges();

    expect(themeRoot.className).toBe('amoledblack');
  });

  it('should render routed components and report page views to analytics', fakeAsync(() => {
    const router = TestBed.inject(Router);
    TestBed.inject(NgZone).run(() => router.navigateByUrl('/'));
    tick();
    fixture.detectChanges();

    expect(element.querySelector('.routed')).toBeTruthy();
    expect(ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  }));
});
