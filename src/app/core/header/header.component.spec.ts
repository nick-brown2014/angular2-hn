import { TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('HeaderComponent', () => {
  const settingsStub = jasmine.createSpyObj('SettingsService', ['toggleSettings']);
  (settingsStub as any).settings = { showSettings: false };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [{ provide: SettingsService, useValue: settingsStub }]
    });
    TestBed.overrideTemplate(HeaderComponent, '');
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('toggleSettings should delegate to SettingsService', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.toggleSettings();
    expect(settingsStub.toggleSettings).toHaveBeenCalled();
  });
});
