import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../shared/services/settings.service';
import { createMockSettingsService } from '../../../testing/mock-settings.service';

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let component: SettingsComponent;
  let settingsService: ReturnType<typeof createMockSettingsService>;

  beforeEach(async () => {
    settingsService = createMockSettingsService();

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SettingsComponent],
      providers: [{ provide: SettingsService, useValue: settingsService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('exposes settings from the SettingsService', () => {
    expect(component.settings).toBe(settingsService.settings);
  });

  it('closeSettings delegates to toggleSettings', () => {
    component.closeSettings();
    expect(settingsService.toggleSettings).toHaveBeenCalled();
  });

  it('toggleOpenLinksInNewTab delegates to the service', () => {
    component.toggleOpenLinksInNewTab();
    expect(settingsService.toggleOpenLinksInNewTab).toHaveBeenCalled();
  });

  it('selectTheme delegates to setTheme', () => {
    component.selectTheme('sepia');
    expect(settingsService.setTheme).toHaveBeenCalledWith('sepia');
  });

  it('changeTitleFont delegates to setFont', () => {
    component.changeTitleFont('20');
    expect(settingsService.setFont).toHaveBeenCalledWith('20');
  });

  it('changeSpacing delegates to setSpacing', () => {
    component.changeSpacing('10');
    expect(settingsService.setSpacing).toHaveBeenCalledWith('10');
  });
});
