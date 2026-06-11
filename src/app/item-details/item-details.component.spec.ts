import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Story } from '../shared/models/story';
import { CommentPipe } from '../shared/pipes/comment.pipe';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let mockHnService: any;
  let mockSettingsService: any;
  let mockLocation: any;
  let paramsSubject: BehaviorSubject<any>;

  const mockItem: Story = {
    id: 123, title: 'Test Item', points: 50, user: 'author', time: 0,
    time_ago: 0, type: 'story', url: 'http://example.com', domain: 'example.com',
    comments: [], comments_count: 10, poll: [], poll_votes_count: 0,
    deleted: false, dead: false
  } as Story;

  beforeEach(async(() => {
    paramsSubject = new BehaviorSubject({ id: '123' });

    mockHnService = {
      fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(mockItem))
    };

    mockSettingsService = {
      settings: {
        showSettings: false,
        openLinkInNewTab: false,
        theme: 'default',
        titleFontSize: '16',
        listSpacing: '0'
      }
    };

    mockLocation = {
      back: jasmine.createSpy('back')
    };

    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent, CommentPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHnService },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ActivatedRoute, useValue: { params: paramsSubject } },
        { provide: Location, useValue: mockLocation }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch item content using route param id on ngOnInit', () => {
    fixture.detectChanges();
    expect(mockHnService.fetchItemContent).toHaveBeenCalledWith(123);
  });

  it('should populate item on success', () => {
    fixture.detectChanges();
    expect(component.item).toEqual(mockItem);
  });

  it('should set errorMessage on error', () => {
    mockHnService.fetchItemContent.and.returnValue(throwError('fail'));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load item comments.');
  });

  it('should call window.scrollTo(0, 0) on ngOnInit', () => {
    fixture.detectChanges();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  describe('goBack', () => {
    it('should call _location.back()', () => {
      component.goBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('hasUrl getter', () => {
    it('should return true when item.url starts with http', () => {
      component.item = { ...mockItem, url: 'http://test.com' } as Story;
      expect(component.hasUrl).toBe(true);
    });

    it('should return true when item.url starts with https', () => {
      component.item = { ...mockItem, url: 'https://test.com' } as Story;
      expect(component.hasUrl).toBe(true);
    });

    it('should return false for non-http URLs', () => {
      component.item = { ...mockItem, url: 'item?id=123' } as Story;
      expect(component.hasUrl).toBe(false);
    });

    it('should return false for empty string', () => {
      component.item = { ...mockItem, url: '' } as Story;
      expect(component.hasUrl).toBe(false);
    });
  });

  it('should set settings from SettingsService', () => {
    expect(component.settings).toBe(mockSettingsService.settings);
  });

  it('should fetch new item when route params change', () => {
    fixture.detectChanges();
    const newItem = { ...mockItem, id: 456 } as Story;
    mockHnService.fetchItemContent.and.returnValue(of(newItem));
    paramsSubject.next({ id: '456' });
    expect(mockHnService.fetchItemContent).toHaveBeenCalledWith(456);
    expect(component.item).toEqual(newItem);
  });
});
