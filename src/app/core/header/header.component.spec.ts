import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';

class SettingsServiceStub {
  settings: Settings = {
    showSettings: false,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
  };

  toggleSettings = jasmine.createSpy('toggleSettings').and.callFake(() => {
    this.settings.showSettings = !this.settings.showSettings;
  });
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let settings: SettingsServiceStub;

  beforeEach(async(() => {
    settings = new SettingsServiceStub();
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settings }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the shared settings object', () => {
    expect(component.settings).toBe(settings.settings);
  });

  it('renders the navigation links', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.header-nav').textContent).toContain('new');
  });

  it('delegates toggleSettings to the SettingsService', () => {
    component.toggleSettings();
    expect(settings.toggleSettings).toHaveBeenCalled();
    expect(component.settings.showSettings).toBe(true);
  });

  it('scrollTop scrolls the window to the top', () => {
    spyOn(window, 'scrollTo');
    component.scrollTop();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
