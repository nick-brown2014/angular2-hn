import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemComponent } from './item.component';
import { SettingsService } from '../../shared/services/settings.service';
import { Story } from '../../shared/models/story';
import { CommentPipe } from '../../shared/pipes/comment.pipe';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let mockSettingsService: any;

  const makeStory = (overrides: Partial<Story> = {}): Story => ({
    id: 1, title: 'Test Story', points: 42, user: 'testuser', time: 0,
    time_ago: 0, type: 'story', url: 'http://example.com', domain: 'example.com',
    comments: [], comments_count: 10, poll: [], poll_votes_count: 0,
    deleted: false, dead: false, ...overrides
  } as Story);

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
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: SettingsService, useValue: mockSettingsService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = makeStory();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set settings from SettingsService', () => {
    expect(component.settings).toBe(mockSettingsService.settings);
  });

  describe('hasUrl getter', () => {
    it('should return true when item.url starts with http', () => {
      component.item = makeStory({ url: 'http://example.com' });
      expect(component.hasUrl).toBe(true);
    });

    it('should return true when item.url starts with https', () => {
      component.item = makeStory({ url: 'https://example.com' });
      expect(component.hasUrl).toBe(true);
    });

    it('should return false for non-http URLs', () => {
      component.item = makeStory({ url: 'item?id=123' });
      expect(component.hasUrl).toBe(false);
    });

    it('should return false for empty string', () => {
      component.item = makeStory({ url: '' });
      expect(component.hasUrl).toBe(false);
    });
  });

  describe('template rendering', () => {
    it('should display item title', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.title').textContent).toContain('Test Story');
    });

    it('should display item domain when hasUrl is true', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.domain').textContent).toContain('example.com');
    });

    it('should display item points', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const text = compiled.textContent;
      expect(text).toContain('42');
    });

    it('should display item user', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('testuser');
    });

    it('should set target _blank when openLinkInNewTab is true', () => {
      mockSettingsService.settings.openLinkInNewTab = true;
      fixture.detectChanges();
      const link = fixture.nativeElement.querySelector('a.title[href]');
      if (link) {
        expect(link.getAttribute('target')).toBe('_blank');
      }
    });

    it('should not set target when openLinkInNewTab is false', () => {
      mockSettingsService.settings.openLinkInNewTab = false;
      fixture.detectChanges();
      const link = fixture.nativeElement.querySelector('a.title[href]');
      if (link) {
        expect(link.getAttribute('target')).toBeNull();
      }
    });
  });
});
