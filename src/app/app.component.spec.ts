import { Component, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

@Component({ template: '' })
class BlankComponent {}

describe('AppComponent', () => {
  let ga: jasmine.Spy;

  beforeEach(() => {
    ga = jasmine.createSpy('ga');
    (window as any).ga = ga;

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'news/:page', component: BlankComponent }])],
      declarations: [AppComponent, BlankComponent],
      providers: [{ provide: SettingsService, useValue: { settings: { theme: 'night' } } }],
      // header/footer have their own specs
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the shell with the current theme class', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.firstElementChild.className).toBe('night');
    expect(el.querySelector('.wrapper app-header')).not.toBeNull();
    expect(el.querySelector('.wrapper router-outlet')).not.toBeNull();
    expect(el.querySelector('.wrapper app-footer')).not.toBeNull();
  });

  it('reports page views to Google Analytics on navigation', fakeAsync(() => {
    TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);

    TestBed.inject(NgZone).run(() => router.navigateByUrl('/news/2'));
    tick();

    expect(ga).toHaveBeenCalledWith('set', 'page', '/news/2');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  }));
});
