import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { ActivatedRoute } from '@angular/router';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let mockHnService: any;
  let paramsSubject: BehaviorSubject<any>;
  let dataSubject: BehaviorSubject<any>;

  const mockStories: Story[] = [
    { id: 1, title: 'Story 1', points: 10, user: 'u1', time: 0, time_ago: 0, type: 'story', url: 'http://a.com', domain: 'a.com', comments: [], comments_count: 5, poll: [], poll_votes_count: 0, deleted: false, dead: false },
    { id: 2, title: 'Story 2', points: 20, user: 'u2', time: 0, time_ago: 0, type: 'story', url: 'http://b.com', domain: 'b.com', comments: [], comments_count: 3, poll: [], poll_votes_count: 0, deleted: false, dead: false }
  ];

  beforeEach(async(() => {
    paramsSubject = new BehaviorSubject({ page: '2' });
    dataSubject = new BehaviorSubject({ feedType: 'news' });

    mockHnService = {
      fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(mockStories))
    };

    spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: HackerNewsAPIService, useValue: mockHnService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject,
            data: dataSubject
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to route data for feedType on ngOnInit', () => {
    fixture.detectChanges();
    expect(component.feedType).toBe('news');
  });

  it('should subscribe to route params for page on ngOnInit', () => {
    fixture.detectChanges();
    expect(component.pageNum).toBe(2);
  });

  it('should call fetchFeed with correct feedType and page number', () => {
    fixture.detectChanges();
    expect(mockHnService.fetchFeed).toHaveBeenCalledWith('news', 2);
  });

  it('should populate items on success', () => {
    fixture.detectChanges();
    expect(component.items).toEqual(mockStories);
  });

  it('should calculate listStart correctly: ((pageNum - 1) * 30) + 1', () => {
    fixture.detectChanges();
    expect(component.listStart).toBe(31); // ((2-1)*30)+1 = 31
  });

  it('should default page to 1 when no page param provided', () => {
    paramsSubject.next({});
    fixture.detectChanges();
    expect(component.pageNum).toBe(1);
  });

  it('should set errorMessage on error', () => {
    mockHnService.fetchFeed.and.returnValue(throwError('fail'));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load news stories.');
  });

  it('should set correct errorMessage for different feed types', () => {
    dataSubject.next({ feedType: 'show' });
    mockHnService.fetchFeed.and.returnValue(throwError('fail'));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load show stories.');
  });

  it('should call window.scrollTo(0, 0) on complete', () => {
    fixture.detectChanges();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should calculate listStart as 1 for page 1', () => {
    paramsSubject.next({ page: '1' });
    fixture.detectChanges();
    expect(component.listStart).toBe(1);
  });

  it('should update when route params change', () => {
    fixture.detectChanges();
    expect(component.pageNum).toBe(2);

    mockHnService.fetchFeed.and.returnValue(of(mockStories));
    paramsSubject.next({ page: '3' });
    expect(component.pageNum).toBe(3);
    expect(mockHnService.fetchFeed).toHaveBeenCalledWith('news', 3);
  });
});
