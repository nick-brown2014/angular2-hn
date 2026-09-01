import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Observable, Subject, of, throwError } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let routeData: Subject<any>;
  let routeParams: Subject<any>;
  let feed$: Subject<Story[]>;

  const stories = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }] as Story[];

  beforeEach(async(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    feed$ = new Subject<Story[]>();
    apiService.fetchFeed.and.returnValue(feed$.asObservable());

    routeData = new Subject<any>();
    routeParams = new Subject<any>();

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { data: routeData.asObservable(), params: routeParams.asObservable() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    spyOn(window, 'scrollTo');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('sets feedType from route data', () => {
      routeData.next({ feedType: 'ask' });
      expect(component.feedType).toBe('ask');
    });

    it('fetches the feed for the route page and sets items on success', () => {
      routeData.next({ feedType: 'news' });
      routeParams.next({ page: '3' });

      expect(component.pageNum).toBe(3);
      expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 3);

      feed$.next(stories);
      expect(component.items).toBe(stories);
      expect(component.errorMessage).toBe('');
    });

    it('defaults to page 1 when no page param is present', () => {
      routeData.next({ feedType: 'show' });
      routeParams.next({});

      expect(component.pageNum).toBe(1);
      expect(apiService.fetchFeed).toHaveBeenCalledWith('show', 1);
    });

    it('sets listStart and scrolls to top on completion', () => {
      routeData.next({ feedType: 'news' });
      routeParams.next({ page: '2' });

      feed$.next(stories);
      feed$.complete();

      expect(component.listStart).toBe(((2 - 1) * 30) + 1);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('computes listStart = 1 for the first page', () => {
      routeData.next({ feedType: 'news' });
      routeParams.next({ page: '1' });

      feed$.next(stories);
      feed$.complete();

      expect(component.listStart).toBe(1);
    });

    it('sets errorMessage on error', () => {
      apiService.fetchFeed.and.returnValue(throwError(new Error('boom')));
      routeData.next({ feedType: 'jobs' });
      routeParams.next({ page: '1' });

      expect(component.items).toBeUndefined();
      expect(component.errorMessage).toBe('Could not load jobs stories.');
      expect(component.listStart).toBeUndefined();
    });

    it('re-fetches when the page param changes', () => {
      apiService.fetchFeed.and.returnValue(of(stories) as Observable<Story[]>);
      routeData.next({ feedType: 'newest' });

      routeParams.next({ page: '1' });
      routeParams.next({ page: '2' });

      expect(apiService.fetchFeed).toHaveBeenCalledTimes(2);
      expect(apiService.fetchFeed).toHaveBeenCalledWith('newest', 1);
      expect(apiService.fetchFeed).toHaveBeenCalledWith('newest', 2);
      expect(component.listStart).toBe(31);
    });
  });
});
