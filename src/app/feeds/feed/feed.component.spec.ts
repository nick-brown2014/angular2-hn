import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let mockHackerNewsAPIService: any;
  let mockActivatedRoute: any;

  const mockStories = [
    { id: 1, title: 'Story 1', url: 'http://example.com' },
    { id: 2, title: 'Story 2', url: 'http://example2.com' }
  ];

  beforeEach(async(() => {
    mockHackerNewsAPIService = {
      fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(mockStories))
    };

    mockActivatedRoute = {
      data: of({ feedType: 'news' }),
      params: of({ page: '2' })
    };

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(window, 'scrollTo');
    const fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to route data for feedType and route params for page', () => {
    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(2);
  });

  it('should call HackerNewsAPIService.fetchFeed with correct arguments', () => {
    expect(mockHackerNewsAPIService.fetchFeed).toHaveBeenCalledWith('news', 2);
  });

  it('should set items when API returns data', () => {
    expect(component.items).toEqual(mockStories as any);
  });

  it('should set errorMessage when API returns error', () => {
    mockHackerNewsAPIService.fetchFeed.and.returnValue(throwError('error'));
    mockActivatedRoute.params = of({ page: '1' });

    const fixture = TestBed.createComponent(FeedComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.errorMessage).toBe('Could not load news stories.');
  });

  it('should calculate listStart correctly: ((pageNum - 1) * 30) + 1', () => {
    expect(component.listStart).toBe(((2 - 1) * 30) + 1);
  });
});
