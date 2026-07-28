import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    (window as any).ga = jasmine.createSpy('ga');

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: Router, useValue: { events: of() } },
        { provide: SettingsService, useValue: { settings: { theme: 'default' } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose the settings from the service', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.settings.theme).toBe('default');
  });
});
