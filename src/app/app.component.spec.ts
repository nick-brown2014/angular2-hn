import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings } from './shared/models/settings';

declare const window: any;

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let settingsServiceStub: { settings: Settings };

  beforeEach(async () => {
    // The component calls a global `ga` function on NavigationEnd; provide a stub.
    window.ga = jasmine.createSpy('ga');

    settingsServiceStub = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: SettingsService, useValue: settingsServiceStub }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render router-outlet', () => {
    fixture.detectChanges();
    const outlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(outlet).toBeTruthy();
  });
});
