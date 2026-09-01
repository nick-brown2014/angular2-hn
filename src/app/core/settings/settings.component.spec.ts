import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settingsService: jasmine.SpyObj<SettingsService>;
  const settings = {
    showSettings: true,
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0'
  };

  beforeEach(() => {
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', [
      'toggleSettings',
      'toggleOpenLinksInNewTab',
      'setTheme',
      'setFont',
      'setSpacing'
    ]);
    (settingsService as any).settings = settings;

    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is created with the settings from the settings service', () => {
    expect(component).toBeTruthy();
    expect(component.settings).toBe(settings as any);
  });

  it('closeSettings delegates to the settings service', () => {
    component.closeSettings();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('clicking the close button closes the panel', () => {
    fixture.nativeElement.querySelector('.close').click();

    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggleOpenLinksInNewTab delegates to the settings service', () => {
    component.toggleOpenLinksInNewTab();

    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('selectTheme delegates to the settings service', () => {
    component.selectTheme('night');

    expect(settingsService.setTheme).toHaveBeenCalledWith('night');
  });

  it('clicking a theme radio selects that theme', () => {
    const radios: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('input[name="theme"][type="radio"]')
    );
    radios[radios.length - 1].click();

    expect(settingsService.setTheme).toHaveBeenCalledWith('amoledblack');
  });

  it('changeTitleFont delegates to the settings service', () => {
    component.changeTitleFont('20');

    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('changeSpacing delegates to the settings service', () => {
    component.changeSpacing('6');

    expect(settingsService.setSpacing).toHaveBeenCalledWith('6');
  });
});
