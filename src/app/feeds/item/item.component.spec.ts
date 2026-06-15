import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { CommentPipe } from '../../shared/pipes/comment.pipe';

describe('ItemComponent', () => {
  let component: ItemComponent;
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
      declarations: [ItemComponent, CommentPipe],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 1,
      title: 'Test Story',
      points: 100,
      user: 'testuser',
      time: 1234567890,
      time_ago: 1234567890,
      type: 'story' as any,
      url: 'http://example.com',
      domain: 'example.com',
      comments: [],
      comments_count: 5,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hasUrl should return true when item.url starts with http', () => {
    component.item.url = 'http://example.com';
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should return false when item.url does not start with http', () => {
    component.item.url = '';
    expect(component.hasUrl).toBe(false);

    component.item.url = '/relative/path';
    expect(component.hasUrl).toBe(false);
  });
});
