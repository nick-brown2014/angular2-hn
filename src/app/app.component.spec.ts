import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SettingsService } from './shared/services/settings.service';
import { BlankComponent, createSettingsServiceStub, makeSettings, SettingsServiceStub } from '../testing/mocks';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let el: HTMLElement;
  let settingsService: SettingsServiceStub;
  let ga: jasmine.Spy;

  beforeEach(() => {
    ga = (window as any).ga = jasmine.createSpy('ga');
    settingsService = createSettingsServiceStub(makeSettings({ theme: 'night' }));

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', component: BlankComponent }]), CoreModule],
      declarations: [AppComponent, BlankComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }],
    });
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  afterEach(() => {
    delete (window as any).ga;
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header, router outlet and footer', () => {
    const wrapper = el.querySelector('.wrapper');
    expect(wrapper.querySelector('app-header')).not.toBeNull();
    expect(wrapper.querySelector('router-outlet')).not.toBeNull();
    expect(wrapper.querySelector('app-footer')).not.toBeNull();
  });

  it('applies the current theme as a class on the root element', () => {
    expect(el.firstElementChild.className).toBe('night');
  });

  it('updates the theme class when the theme changes', () => {
    settingsService.settings.theme = 'amoledblack';
    fixture.detectChanges();
    expect(el.firstElementChild.className).toBe('amoledblack');
  });

  it('reports page views to Google Analytics on navigation', fakeAsync(() => {
    const router = TestBed.inject(Router);
    fixture.ngZone.run(() => router.navigateByUrl('/news/2'));
    tick();

    expect(ga).toHaveBeenCalledWith('set', 'page', '/news/2');
    expect(ga).toHaveBeenCalledWith('send', 'pageview');
  }));
});
