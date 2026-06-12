import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let mockSettingsService: any;

  beforeEach(async(() => {
    mockSettingsService = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    TestBed.configureTestingModule({
      imports: [PipesModule, RouterTestingModule],
      declarations: [ItemComponent],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 1, title: 'Test', points: 10, user: 'user', time: 123, time_ago: 1,
      type: 'link' as any, url: 'http://example.com', domain: 'example.com',
      comments: [], comments_count: 0, poll: [], poll_votes_count: 0,
      deleted: false, dead: false
    } as Story;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set settings from SettingsService', () => {
    expect(component.settings).toBe(mockSettingsService.settings);
  });

  it('hasUrl should return true when item.url starts with http', () => {
    component.item.url = 'http://example.com';
    expect(component.hasUrl).toBe(true);

    component.item.url = 'https://example.com';
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should return false when item.url does not start with http', () => {
    component.item.url = 'item?id=123';
    expect(component.hasUrl).toBe(false);

    component.item.url = '';
    expect(component.hasUrl).toBe(false);
  });
});
