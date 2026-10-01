import { Component, NgZone } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SettingsService } from './shared/services/settings.service';
import { mockSettings } from './testing/mock-data';

@Component({ template: '<p class="stub-feed">feed</p>' })
class StubFeedComponent {}

describe('AppComponent', () => {
  const globalScope = window as unknown as { ga?: jasmine.Spy };
  let originalGa: jasmine.Spy;
  let fixture: ComponentFixture<AppComponent>;
  let element: HTMLElement;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    originalGa = globalScope.ga;
    globalScope.ga = jasmine.createSpy('ga');

    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['toggleSettings']);
    settingsService.settings = mockSettings();

    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'news/1', pathMatch: 'full' },
          { path: 'news/:page', component: StubFeedComponent }
        ])
      ],
      declarations: [AppComponent, StubFeedComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    });

    fixture = TestBed.createComponent(AppComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    globalScope.ga = originalGa;
  });

  it('creates the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header, router outlet and footer', () => {
    const wrapper = element.querySelector('.wrapper');

    expect(wrapper.querySelector('app-header')).not.toBeNull();
    expect(wrapper.querySelector('router-outlet')).not.toBeNull();
    expect(wrapper.querySelector('app-footer')).not.toBeNull();
    expect(element.querySelector('#header')).not.toBeNull();
    expect(element.querySelector('#footer')).not.toBeNull();
  });

  it('shares the settings object from SettingsService', () => {
    expect(fixture.componentInstance.settings).toBe(settingsService.settings);
  });

  it('applies the current theme as the root class', () => {
    expect(element.firstElementChild.className).toBe('default');
  });

  it('re-renders the theme class when the shared settings change', () => {
    settingsService.settings.theme = 'night';
    fixture.detectChanges();

    expect(element.firstElementChild.className).toBe('night');
  });

  it('shows the settings panel when settings are opened', () => {
    expect(element.querySelector('app-settings')).toBeNull();

    settingsService.settings.showSettings = true;
    fixture.detectChanges();

    expect(element.querySelector('app-settings')).not.toBeNull();
  });

  it('reports a Google Analytics pageview after each navigation', async () => {
    const router = TestBed.inject(Router);
    const zone = TestBed.inject(NgZone);

    await zone.run(() => router.navigateByUrl('/'));
    fixture.detectChanges();

    expect(globalScope.ga).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(globalScope.ga).toHaveBeenCalledWith('send', 'pageview');
    expect(element.querySelector('.stub-feed')).not.toBeNull();
  });
});
