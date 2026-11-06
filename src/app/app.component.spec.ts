import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { createSettingsServiceSpy, makeSettings } from '../testing/mocks';

@Component({ template: '<p class="routed">routed</p>' })
class BlankComponent {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let el: HTMLElement;
  let ga: jasmine.Spy;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    ga = (window as any).ga = jasmine.createSpy('ga');
    settingsService = createSettingsServiceSpy(makeSettings({ theme: 'night' }));

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: '', redirectTo: 'news/1', pathMatch: 'full' },
        { path: '**', component: BlankComponent },
      ])],
      declarations: [AppComponent, BlankComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
      // Header and footer have their own specs.
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AppComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => delete (window as any).ga);

  it('renders the header, router outlet and footer inside the wrapper', () => {
    const wrapper = el.querySelector('.wrapper');

    expect(Array.from(wrapper.children).map(c => c.tagName.toLowerCase()))
      .toEqual(['app-header', 'router-outlet', 'app-footer']);
  });

  it('applies the current theme as a class on the root element', () => {
    const root = el.firstElementChild;
    expect(root.className).toBe('night');

    settingsService.settings.theme = 'amoledblack';
    fixture.detectChanges();
    expect(root.className).toBe('amoledblack');
  });

  it('reports a pageview to Google Analytics using the post-redirect URL', fakeAsync(() => {
    const router = TestBed.inject(Router);

    fixture.ngZone.run(() => router.navigateByUrl('/'));
    tick();

    expect(ga.calls.allArgs()).toEqual([
      ['set', 'page', '/news/1'],
      ['send', 'pageview'],
    ]);
  }));

  it('reports one pageview per completed navigation', fakeAsync(() => {
    const router = TestBed.inject(Router);

    fixture.ngZone.run(() => router.navigateByUrl('/item/1'));
    tick();
    fixture.ngZone.run(() => router.navigateByUrl('/user/pg'));
    tick();
    fixture.detectChanges();

    expect(ga.calls.allArgs().filter(args => args[0] === 'set')).toEqual([
      ['set', 'page', '/item/1'],
      ['set', 'page', '/user/pg'],
    ]);
    expect(el.querySelector('.routed')).not.toBeNull();
  }));
});
