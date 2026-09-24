import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

import { FeedComponent } from './feed.component';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';

describe('FeedComponent', () => {
  let fixture: ComponentFixture<FeedComponent>;
  let component: FeedComponent;
  let apiService: jasmine.SpyObj<HackerNewsAPIService>;
  let routeData: Subject<any>;
  let routeParams: Subject<any>;
  let scrollSpy: jasmine.Spy;

  const stories = (count: number): Story[] =>
    Array.from({ length: count }, (_, i) => ({ id: i + 1, title: `Story ${i + 1}` } as Story));

  beforeEach(() => {
    apiService = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchFeed']);
    routeData = new Subject<any>();
    routeParams = new Subject<any>();
    scrollSpy = spyOn(window, 'scrollTo');

    TestBed.configureTestingModule({
      declarations: [FeedComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: apiService },
        { provide: ActivatedRoute, useValue: { data: routeData.asObservable(), params: routeParams.asObservable() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the loader until items arrive', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeNull();
  });

  it('loads the feed for the route feedType and page', () => {
    const items = stories(30);
    apiService.fetchFeed.and.returnValue(of(items));
    fixture.detectChanges();

    routeData.next({ feedType: 'news' });
    routeParams.next({ page: '2' });

    expect(apiService.fetchFeed).toHaveBeenCalledWith('news', 2);
    expect(component.feedType).toBe('news');
    expect(component.pageNum).toBe(2);
    expect(component.items).toBe(items);
    expect(component.listStart).toBe(31);
    expect(component.errorMessage).toBe('');
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it('defaults to page 1 when no page param is present', () => {
    apiService.fetchFeed.and.returnValue(of(stories(3)));
    fixture.detectChanges();

    routeData.next({ feedType: 'ask' });
    routeParams.next({});

    expect(apiService.fetchFeed).toHaveBeenCalledWith('ask', 1);
    expect(component.pageNum).toBe(1);
    expect(component.listStart).toBe(1);
  });

  it('renders one <item> per story with the correct list start', () => {
    apiService.fetchFeed.and.returnValue(of(stories(3)));
    fixture.detectChanges();
    routeData.next({ feedType: 'show' });
    routeParams.next({ page: '3' });
    fixture.detectChanges();

    const list: HTMLOListElement = fixture.nativeElement.querySelector('ol');
    expect(list.getAttribute('start')).toBe('61');
    expect(fixture.nativeElement.querySelectorAll('li.post').length).toBe(3);
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
  });

  it('shows the "More" link only when a full page of 30 items was returned', () => {
    apiService.fetchFeed.and.returnValue(of(stories(30)));
    fixture.detectChanges();
    routeData.next({ feedType: 'news' });
    routeParams.next({ page: '1' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.more')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a.prev')).toBeNull();
  });

  it('shows the "Prev" link on pages after the first', () => {
    apiService.fetchFeed.and.returnValue(of(stories(10)));
    fixture.detectChanges();
    routeData.next({ feedType: 'news' });
    routeParams.next({ page: '2' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a.prev')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a.more')).toBeNull();
  });

  it('sets errorMessage and renders the error component when the fetch fails', () => {
    apiService.fetchFeed.and.returnValue(throwError(new Error('boom')));
    fixture.detectChanges();

    routeData.next({ feedType: 'jobs' });
    routeParams.next({ page: '1' });
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load jobs stories.');
    expect(component.items).toBeUndefined();
    expect(fixture.nativeElement.querySelector('app-error-message')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
  });

  it('refetches when the page param changes', () => {
    apiService.fetchFeed.and.returnValue(of(stories(30)));
    fixture.detectChanges();
    routeData.next({ feedType: 'news' });
    routeParams.next({ page: '1' });
    routeParams.next({ page: '2' });

    expect(apiService.fetchFeed.calls.allArgs()).toEqual([['news', 1], ['news', 2]]);
    expect(component.listStart).toBe(31);
  });
});
