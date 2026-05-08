import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let apiServiceSpy: jasmine.SpyObj<HackerNewsAPIService>;
  let dataSubject: BehaviorSubject<{ feedType: string }>;
  let paramsSubject: BehaviorSubject<{ [key: string]: string }>;

  function makeStory(id: number): Story {
    return {
      id,
      title: `Story ${id}`,
      points: 1,
      user: 'someone',
      time: 0,
      time_ago: 0,
      type: 'story',
      url: 'https://example.com',
      domain: 'example.com',
      comments: [],
      comments_count: 0,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    } as Story;
  }

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    apiServiceSpy.fetchFeed.and.returnValue(of([makeStory(1)]));

    dataSubject = new BehaviorSubject<{ feedType: string }>({ feedType: 'news' });
    paramsSubject = new BehaviorSubject<{ [key: string]: string }>({ page: '1' });

    await TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            data: dataSubject.asObservable(),
            params: paramsSubject.asObservable()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should read feedType from route data', () => {
    fixture.detectChanges();
    expect(component.feedType).toBe('news');
  });

  it('should default pageNum to 1 when no page param is supplied', () => {
    paramsSubject.next({});
    fixture.detectChanges();
    expect(component.pageNum).toBe(1);
  });

  it('should set pageNum from the route params', () => {
    paramsSubject.next({ page: '3' });
    fixture.detectChanges();
    expect(component.pageNum).toBe(3);
  });

  it('should call fetchFeed with the correct feedType and pageNum', () => {
    fixture.detectChanges();
    expect(apiServiceSpy.fetchFeed).toHaveBeenCalledWith('news', 1);
  });

  it('should set items when the API returns successfully', () => {
    const stories = [makeStory(1), makeStory(2)];
    apiServiceSpy.fetchFeed.and.returnValue(of(stories));
    fixture.detectChanges();
    expect(component.items).toEqual(stories);
  });

  it('should set errorMessage when the API errors', () => {
    apiServiceSpy.fetchFeed.and.returnValue(throwError(new Error('boom')));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Could not load news stories.');
  });

  it('should compute listStart as ((pageNum - 1) * 30) + 1', () => {
    paramsSubject.next({ page: '4' });
    fixture.detectChanges();
    expect(component.listStart).toBe(((4 - 1) * 30) + 1);
  });

  it('should show pagination "More" link when items.length === 30', () => {
    const stories = Array.from({ length: 30 }, (_, i) => makeStory(i + 1));
    apiServiceSpy.fetchFeed.and.returnValue(of(stories));
    fixture.detectChanges();
    const moreLink = fixture.debugElement.nativeElement.querySelector('a.more');
    expect(moreLink).toBeTruthy();
  });

  it('should show "Prev" link when listStart !== 1', () => {
    paramsSubject.next({ page: '2' });
    apiServiceSpy.fetchFeed.and.returnValue(of([makeStory(1)]));
    fixture.detectChanges();
    const prevLink = fixture.debugElement.nativeElement.querySelector('a.prev');
    expect(prevLink).toBeTruthy();
  });
});
