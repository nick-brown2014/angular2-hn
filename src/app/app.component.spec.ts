import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { createSettings, createSettingsServiceSpy } from '../testing/mocks';

@Component({ template: '' })
class BlankComponent {}

interface GaWindow {
  ga: jasmine.Spy;
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let router: Router;
  let gaSpy: jasmine.Spy;

  beforeEach(() => {
    gaSpy = jasmine.createSpy('ga');
    (window as unknown as GaWindow).ga = gaSpy;

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'news/1', pathMatch: 'full' },
          { path: 'news/:page', component: BlankComponent },
        ]),
      ],
      declarations: [AppComponent, BlankComponent],
      providers: [{ provide: SettingsService, useValue: createSettingsServiceSpy(createSettings({ theme: 'night' })) }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('creates the app', () => {
    expect(component).toBeTruthy();
  });

  it('exposes settings from SettingsService', () => {
    expect(component.settings.theme).toBe('night');
  });

  it('applies the theme class to the root wrapper', () => {
    const root: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(root.classList).toContain('night');
  });

  it('renders the header, router outlet and footer', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-header')).not.toBeNull();
    expect(el.querySelector('router-outlet')).not.toBeNull();
    expect(el.querySelector('app-footer')).not.toBeNull();
  });

  it('reports page views to Google Analytics on NavigationEnd', fakeAsync(() => {
    fixture.ngZone.run(() => router.navigate(['']));
    tick();

    expect(gaSpy).toHaveBeenCalledWith('set', 'page', '/news/1');
    expect(gaSpy).toHaveBeenCalledWith('send', 'pageview');
  }));
});
