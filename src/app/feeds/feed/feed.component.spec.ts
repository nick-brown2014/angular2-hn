import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let apiService: { fetchFeed: jasmine.Spy };
  let params: Observable<any>;
  const stories = [{ id: 1, title: 'A story' }] as Story[];

  const createComponent = () => {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async(() => {
    params = of({});
    apiService = { fetchFeed: jasmine.createSpy('fetchFeed').and.returnValue(of(stories)) };

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        {
          provide: ActivatedRoute,
          useValue: {
            get params() {
              return params;
            },
            data: of({ feedType: 'news' })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should load the first page of the feed by default', () => {
    createComponent();
    component.ngOnInit();

    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(1);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 1);
    expect(component.items).toEqual(stories);
    expect(component.listStart).toBe(1);
  });

  it('should use the page route param and compute the list start', () => {
    params = of({ page: '3' });
    createComponent();
    component.ngOnInit();

    expect(component.pageNum).toBe(3);
    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 3);
    expect(component.listStart).toBe(61);
  });

  it('should set an error message when the feed fails to load', () => {
    apiService.fetchFeed.and.returnValue(throwError('boom'));
    createComponent();
    component.ngOnInit();

    expect(component.errorMessage).toBe('Could not load news stories.');
  });
});
