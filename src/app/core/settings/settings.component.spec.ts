import { TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let settingsStub: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsStub = jasmine.createSpyObj('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]);
    (settingsStub as any).settings = { showSettings: true, theme: 'default' };

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsStub }]
    });
    TestBed.overrideTemplate(SettingsComponent, '');
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should delegate settings actions to SettingsService', () => {
    const component = TestBed.createComponent(SettingsComponent).componentInstance;
    component.closeSettings();
    component.toggleOpenLinksInNewTab();
    component.selectTheme('night');
    component.changeTitleFont('18');
    component.changeSpacing('4');

    expect(settingsStub.toggleSettings).toHaveBeenCalled();
    expect(settingsStub.toggleOpenLinksInNewTab).toHaveBeenCalled();
    expect(settingsStub.setTheme).toHaveBeenCalledWith('night');
    expect(settingsStub.setFont).toHaveBeenCalledWith('18');
    expect(settingsStub.setSpacing).toHaveBeenCalledWith('4');
  });
});
