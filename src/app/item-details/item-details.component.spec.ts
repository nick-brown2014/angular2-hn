import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { CommentPipe } from '../shared/pipes/comment.pipe';

describe('ItemDetailsComponent', () => {
  let component: ItemDetailsComponent;
  let mockHackerNewsAPIService: any;
  let mockLocation: any;
  let mockSettingsService: any;

  const mockItem = {
    id: 123,
    title: 'Test Item',
    url: 'http://example.com',
    type: 'story',
    comments: [],
    comments_count: 0
  };

  beforeEach(async(() => {
    mockHackerNewsAPIService = {
      fetchItemContent: jasmine.createSpy('fetchItemContent').and.returnValue(of(mockItem))
    };

    mockLocation = {
      back: jasmine.createSpy('back')
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

    TestBed.configureTestingModule({
      declarations: [ItemDetailsComponent, CommentPipe],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        { provide: ActivatedRoute, useValue: { params: of({ id: '123' }) } },
        { provide: Location, useValue: mockLocation },
        { provide: SettingsService, useValue: mockSettingsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(window, 'scrollTo');
    const fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to route params and call fetchItemContent(id)', () => {
    expect(mockHackerNewsAPIService.fetchItemContent).toHaveBeenCalledWith(123);
  });

  it('should set item when API succeeds', () => {
    expect(component.item).toEqual(mockItem as any);
  });

  it('should set errorMessage when API fails', () => {
    mockHackerNewsAPIService.fetchItemContent.and.returnValue(throwError('error'));

    const fixture = TestBed.createComponent(ItemDetailsComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.errorMessage).toBe('Could not load item comments.');
  });

  it('goBack() should call Location.back()', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('hasUrl should return true when item url starts with http', () => {
    component.item = { ...mockItem, url: 'http://test.com' } as any;
    expect(component.hasUrl).toBe(true);
  });

  it('hasUrl should return false when item url does not start with http', () => {
    component.item = { ...mockItem, url: '' } as any;
    expect(component.hasUrl).toBe(false);
  });
});
