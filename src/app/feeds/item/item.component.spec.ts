import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let settingsServiceStub: any;

  const mockStory: any = {
    id: 1,
    title: 'Mock Story',
    url: 'https://example.com/foo',
    user: 'tester',
    points: 10,
    comments_count: 2,
    time_ago: '2 hours ago',
    type: 'story'
  };

  beforeEach(() => {
    settingsServiceStub = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      providers: [{ provide: SettingsService, useValue: settingsServiceStub }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = { ...mockStory };
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('pulls settings from the SettingsService', () => {
    expect(component.settings).toBe(settingsServiceStub.settings);
  });

  it('hasUrl returns true when item.url starts with "http"', () => {
    component.item = { ...mockStory, url: 'https://example.com' } as any;
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl returns false when item.url does not start with "http"', () => {
    component.item = { ...mockStory, url: 'item?id=42' } as any;
    expect(component.hasUrl).toBe(false);
  });
});
