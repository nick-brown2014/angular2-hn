import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let mockHnService: any;
  let routeDataSubject: BehaviorSubject<any>;
  let routeParamsSubject: BehaviorSubject<any>;

  const mockStories: Story[] = [
    { id: 1, title: 'Test Story', points: 10, user: 'testuser', time: 123, time_ago: 1, type: 'link' as any, url: 'http://example.com', domain: 'example.com', comments: [], comments_count: 5, poll: [], poll_votes_count: 0, deleted: false, dead: false }
  ];

  beforeEach(async(() => {
    routeDataSubject = new BehaviorSubject({ feedType: 'news' });
    routeParamsSubject = new BehaviorSubject({ page: '1' });

    mockHnService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchFeed']);
    mockHnService.fetchFeed.and.returnValue(of(mockStories));

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHnService },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeDataSubject.asObservable(),
            params: routeParamsSubject.asObservable()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(window, 'scrollTo');
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set feedType from route data', () => {
    expect(component.feedType).toBe('news');
  });

  it('should call fetchFeed with correct feedType and page number', () => {
    expect(mockHnService.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('should populate items after successful fetch', () => {
    expect(component.items).toEqual(mockStories);
  });

  it('should calculate listStart correctly: ((pageNum - 1) * 30) + 1', () => {
    expect(component.listStart).toBe(1);

    routeParamsSubject.next({ page: '2' });
    expect(component.listStart).toBe(31);
  });

  it('should set errorMessage when fetchFeed errors', () => {
    mockHnService.fetchFeed.and.returnValue(throwError('error'));
    routeParamsSubject.next({ page: '1' });
    expect(component.errorMessage).toBe('Could not load news stories.');
  });

  it('should default to page 1 when no page param', () => {
    routeParamsSubject.next({});
    expect(component.pageNum).toBe(1);
  });
});
